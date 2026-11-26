// 合伙人照片处理：抠出人像、换成统一的暖灰背景、按眼睛与脸的大小对齐裁成正方形、轻微调色。
// 用法：portrait <输入图> <输出.jpg> [--size 720] [--face 0.34] [--eye 0.42] [--sat 0.9]
//       [--exp 0] [--warm 0] [--contrast 1] [--sharpen 0] [--choke 0] [--feather 0.8]
//       [--inner E9E6DF] [--outer D9D4CB] [--xshift 0] [--debug 目录]
import Foundation
import CoreImage
import CoreImage.CIFilterBuiltins
import Vision
import ImageIO

func fail(_ s: String) -> Never { FileHandle.standardError.write((s + "\n").data(using: .utf8)!); exit(1) }

var args = Array(CommandLine.arguments.dropFirst())
guard args.count >= 2 else { fail("usage: portrait <in> <out.jpg> [options]") }
let inPath = args.removeFirst(), outPath = args.removeFirst()
var opt: [String: String] = [:]
while !args.isEmpty {
    let k = args.removeFirst()
    guard k.hasPrefix("--"), !args.isEmpty else { fail("bad option \(k)") }
    opt[String(k.dropFirst(2))] = args.removeFirst()
}
func num(_ k: String, _ d: Double) -> Double { opt[k].flatMap(Double.init) ?? d }
let S = CGFloat(num("size", 720))
let faceFrac = CGFloat(num("face", 0.34)), eyeFromTop = CGFloat(num("eye", 0.42)), xShift = CGFloat(num("xshift", 0))
let sat = num("sat", 0.9), expo = num("exp", 0), warm = num("warm", 0), contrast = num("contrast", 1)
let sharpen = num("sharpen", 0), choke = num("choke", 0), feather = num("feather", 0.8), maskGamma = num("gamma", 1)
let debugDir = opt["debug"]

let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CIContext(options: [.workingColorSpace: CGColorSpace(name: CGColorSpace.extendedLinearSRGB)!, .outputColorSpace: srgb])
func hex(_ s: String) -> CIColor {
    let v = UInt32(s, radix: 16) ?? 0xE9E6DF
    return CIColor(red: CGFloat((v >> 16) & 255) / 255, green: CGFloat((v >> 8) & 255) / 255, blue: CGFloat(v & 255) / 255, alpha: 1, colorSpace: srgb)!
}

// 读图，原点归零，铺在白底上（PNG 可能带透明通道）
guard var src = CIImage(contentsOf: URL(fileURLWithPath: inPath), options: [.applyOrientationProperty: true]) else { fail("cannot read \(inPath)") }
src = src.transformed(by: CGAffineTransform(translationX: -src.extent.origin.x, y: -src.extent.origin.y))
src = src.composited(over: CIImage(color: CIColor(red: 1, green: 1, blue: 1, alpha: 1, colorSpace: srgb)!).cropped(to: src.extent))
let W = src.extent.width, H = src.extent.height
guard let cg = ctx.createCGImage(src, from: src.extent) else { fail("cannot render source") }

// 人脸、瞳孔、人像蒙版
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
let faceReq = VNDetectFaceLandmarksRequest()
let segReq = VNGeneratePersonSegmentationRequest()
segReq.qualityLevel = .accurate
segReq.outputPixelFormat = kCVPixelFormatType_OneComponent8
do { try handler.perform([faceReq, segReq]) } catch { fail("vision: \(error)") }
guard let face = (faceReq.results ?? []).max(by: { $0.boundingBox.width < $1.boundingBox.width }) else { fail("no face") }
let bb = VNImageRectForNormalizedRect(face.boundingBox, Int(W), Int(H))
let isz = CGSize(width: W, height: H)
guard let lp = face.landmarks?.leftPupil?.pointsInImage(imageSize: isz).first,
      let rp = face.landmarks?.rightPupil?.pointsInImage(imageSize: isz).first else { fail("no pupils") }
let eyeMid = CGPoint(x: (lp.x + rp.x) / 2, y: (lp.y + rp.y) / 2)
let ipd = hypot(lp.x - rp.x, lp.y - rp.y)
guard let segObs = segReq.results?.first else { fail("no mask") }
var mask = CIImage(cvPixelBuffer: segObs.pixelBuffer)
let mw = mask.extent.width, mh = mask.extent.height
mask = mask.transformed(by: CGAffineTransform(scaleX: W / mw, y: H / mh)).cropped(to: src.extent)

// 蒙版收边与羽化
if choke > 0 { let f = CIFilter.morphologyMinimum(); f.inputImage = mask; f.radius = Float(choke); mask = f.outputImage!.cropped(to: src.extent) }
if feather > 0 { let f = CIFilter.gaussianBlur(); f.inputImage = mask.clampedToExtent(); f.radius = Float(feather); mask = f.outputImage!.cropped(to: src.extent) }
if maskGamma != 1 { let f = CIFilter.gammaAdjust(); f.inputImage = mask; f.power = Float(maskGamma); mask = f.outputImage! }

// 调色：曝光、饱和度、对比度、冷暖
var g = src
if expo != 0 { let f = CIFilter.exposureAdjust(); f.inputImage = g; f.ev = Float(expo); g = f.outputImage! }
do { let f = CIFilter.colorControls(); f.inputImage = g; f.saturation = Float(sat); f.contrast = Float(contrast); f.brightness = 0; g = f.outputImage! }
if warm != 0 {
    let f = CIFilter.colorMatrix(); f.inputImage = g
    f.rVector = CIVector(x: 1 + warm, y: 0, z: 0, w: 0)
    f.gVector = CIVector(x: 0, y: 1 + warm * 0.35, z: 0, w: 0)
    f.bVector = CIVector(x: 0, y: 0, z: 1 - warm, w: 0)
    g = f.outputImage!
}

// 缩放与平移：脸框高度 = faceFrac × 画布，两眼中点落在 (中线 + xShift, 距顶 eyeFromTop)
let s = faceFrac * S / bb.height
func lanczos(_ img: CIImage) -> CIImage { let f = CIFilter.lanczosScaleTransform(); f.inputImage = img; f.scale = Float(s); f.aspectRatio = 1; return f.outputImage! }
let tx = S / 2 + xShift * S - eyeMid.x * s, ty = S * (1 - eyeFromTop) - eyeMid.y * s
let place = CGAffineTransform(translationX: tx, y: ty)
var subj = lanczos(g).transformed(by: place)
if sharpen > 0 { let f = CIFilter.unsharpMask(); f.inputImage = subj; f.radius = 1.4; f.intensity = Float(sharpen); subj = f.outputImage! }
let maskP = lanczos(mask).transformed(by: place)

let canvas = CGRect(x: 0, y: 0, width: S, height: S)
let bg: CIImage = {
    let f = CIFilter.radialGradient()
    f.center = CGPoint(x: S / 2, y: S * 0.62); f.radius0 = Float(S * 0.06); f.radius1 = Float(S * 0.8)
    f.color0 = hex(opt["inner"] ?? "E9E6DF"); f.color1 = hex(opt["outer"] ?? "D9D4CB")
    return f.outputImage!.cropped(to: canvas)
}()
let blend = CIFilter.blendWithMask(); blend.inputImage = subj; blend.backgroundImage = bg; blend.maskImage = maskP
let out = blend.outputImage!.cropped(to: canvas)

let q = CIImageRepresentationOption(rawValue: kCGImageDestinationLossyCompressionQuality as String)
do { try ctx.writeJPEGRepresentation(of: out, to: URL(fileURLWithPath: outPath), colorSpace: srgb, options: [q: num("q", 0.84)]) } catch { fail("write: \(error)") }

// 源图在画布上的位置：底边必须落在画布底边以下，否则身体下方会露出背景
let srcBottom = ty, srcLeft = tx, srcRight = tx + W * s, srcTop = ty + H * s
print(String(format: "%@  src %.0fx%.0f  face %.0fx%.0f  ipd %.1f  mask %.0fx%.0f  scale %.3f", (inPath as NSString).lastPathComponent, W, H, bb.width, bb.height, ipd, mw, mh, s))
print(String(format: "  canvas edges in src px: left %.0f right %.0f top %.0f bottom %.0f%@", -srcLeft / s, (S - srcLeft) / s, (srcTop - S) / s, -srcBottom / s,
             srcBottom > 0.5 ? "  !! source bottom is above canvas bottom" : ""))

if let d = debugDir {
    try? FileManager.default.createDirectory(atPath: d, withIntermediateDirectories: true)
    let base = ((outPath as NSString).lastPathComponent as NSString).deletingPathExtension
    let magenta = CIImage(color: CIColor(red: 1, green: 0, blue: 1, alpha: 1, colorSpace: srgb)!).cropped(to: canvas)
    let chk = CIFilter.blendWithMask(); chk.inputImage = subj; chk.backgroundImage = magenta; chk.maskImage = maskP
    try? ctx.writePNGRepresentation(of: chk.outputImage!.cropped(to: canvas), to: URL(fileURLWithPath: "\(d)/\(base)-check.png"), format: .RGBA8, colorSpace: srgb)
    try? ctx.writePNGRepresentation(of: maskP.composited(over: CIImage(color: .black).cropped(to: canvas)).cropped(to: canvas), to: URL(fileURLWithPath: "\(d)/\(base)-mask.png"), format: .RGBA8, colorSpace: srgb)
}
