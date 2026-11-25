/* Spark Unlimited Investment — 站点配置
 * 上线前请替换这里的占位信息。
 */
window.SPARK_CONFIG = {
  /* 留资表单的提交地址。
   * 留空时表单处于演示模式：会走完整的校验与成功动效，但留言不会被发送，
   * 成功提示下方会显示一行说明。
   * 填入后，表单以 POST + JSON 提交：
   *   { name, company, email, phone, role, message, lang, page, submittedAt }
   * 可以对接自有接口、Formspree / Basin 这类表单服务，或飞书多维表格的自动化 Webhook。
   */
  formEndpoint: '',

  /* 页面上展示的联系邮箱（.example 是保留域名，属于占位） */
  emails: {
    pitch: 'bp@sparkunlimited.example',
    ir: 'ir@sparkunlimited.example',
    hello: 'hello@sparkunlimited.example'
  }
};
