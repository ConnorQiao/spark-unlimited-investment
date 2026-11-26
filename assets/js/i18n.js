/* Spark Unlimited Investment — 文案（中文 / English）
 * 页面上的全部文字都以这里为准：加载时会按当前语言写入带 data-i18n 的元素。
 * 标题里的 <br> 用来控制换行；标题末尾不写句号，页面会接上那枚橙色圆点。
 * hero.ledeShort 是手机上用的短版首屏说明，改 hero.lede 时记得一起看。
 * 页面总是以英文打开；中文只在访客点「中」或地址带 ?lang=zh 时出现。
 */
window.SPARK_I18N = {
  zh: {
    htmlLang: 'zh-CN',
    meta: {
      title: 'Spark Unlimited Investment｜让星火成为无限',
      desc: 'Spark Unlimited Investment 是专注早期与成长期的风险投资机构，投资先进科技、先进消费与独立创作者。'
    },
    a11y: { skip: '跳到正文', menu: '菜单', close: '关闭', lang: '切换语言', nav: '主导航' },
    nav: { about: '介绍', mission: '使命愿景', focus: '投资方向', team: '管理团队', contact: '联系我们' },
    hero: {
      title: '让星火<br>成为无限',
      lede: 'Spark Unlimited Investment 是专注早期与成长期的风险投资机构。我们在想法刚刚点燃的时候入场，以长期资本陪伴先进科技、先进消费与独立创作者。',
      ledeShort: '专注早期与成长期的风险投资机构，在想法刚刚点燃的时候入场。',
      cta: '联系我们',
      more: '了解投资方向'
    },
    about: {
      label: '介绍',
      statement: '我们相信，改变世界的公司最初都只是星火：尚未被验证的技术，还没有品类名的产品，独自动手的创作者。',
      p: '我们的工作是尽早认出它，然后提供足够长久的资本、资源与耐心，让它有机会燃成无限。',
      stages: ['星火', '点燃', '生长', '无限'],
      facts: [
        { label: '投资阶段', value: '种子轮至 B 轮', note: '最早可在产品诞生之前进入' },
        { label: '投资角色', value: '领投与联合领投', note: '重仓看准的公司，并持续加注' },
        { label: '持有周期', value: '以十年为尺度', note: '不因短期波动调整判断' },
        { label: '决策方式', value: '合伙人直接决策', note: '没有层层上报的流程' }
      ]
    },
    mission: {
      label: '使命愿景',
      missionLabel: '使命',
      mission: '在星火最微弱的时候，给它时间、资本与信任。',
      visionLabel: '愿景',
      vision: '可能性没有上限的世界：科技拓宽边界，产品更新生活，个体也能创造伟大的事物。',
      principlesTitle: '信条',
      principles: [
        { title: '早于共识', text: '最好的机会出现在被命名之前。数据不足的时候，我们凭研究与判断做决定。' },
        { title: '长期在场', text: '我们以十年为单位思考。顺境时不抢功，逆境时不离席。' },
        { title: '创始人优先', text: '公司属于创造它的人。我们提供资源与视角，把方向盘留给创始人。' },
        { title: '独立判断', text: '不追热点，不迷信标签。每笔投资都由合伙人亲自研究、亲自负责。' }
      ]
    },
    focus: {
      label: '投资方向',
      title: '资本的配比，<br>就是我们的判断',
      lede: '组合按 70 / 20 / 10 配置。重心放在前沿科技，同时为改变生活方式的产品与品牌、以及独立创造的个人留出位置。',
      areasLabel: '关注领域',
      lookLabel: '我们寻找',
      items: [
        {
          title: '先进科技',
          desc: '推动可能性边界的前沿科技，是组合的核心。',
          // 前两类是基金的正式表述（包括但不限于），小字是举例
          areas: [
            { t: 'AI 产业链', d: '算力与芯片、模型与智能体、AI 应用' },
            { t: '未来产业', d: '具身智能与机器人、能源与新材料、生命科学与合成生物、空间技术' }
          ],
          look: '技术壁垒清晰、有机会定义新品类的团队。我们愿意在产品成形之前进入，并陪伴漫长的研发周期。'
        },
        {
          title: '先进消费',
          desc: '改变人们生活方式的产品与品牌。',
          areas: ['高端品牌', '智能硬件', '高端制造', 'AI 原生消费产品', '健康与长寿', '文化与体验'],
          look: '由产品力驱动、能够跨越周期与地域的品牌。好的消费公司，是新技术变成日常的那一环。'
        },
        {
          title: '独立创作者',
          desc: '以个人之力创造的人。',
          areas: ['独立艺术家', '独立音乐人', '独立手艺人', '独立游戏工作室', '独立制表师', '独立开发者', '内容与知识创作者'],
          look: '作品先于公司。我们支持有鲜明个人表达、已经拥有受众的创作者，形式灵活，以创作者的节奏为准。'
        }
      ]
    },
    team: {
      label: '管理团队',
      title: '为判断负责的人',
      lede: '合伙人直接参与项目的研究、决策与投后。你见到的人，就是做决定的人。',
      // alt 是英文名，以小字跟在中文名后面
      members: [
        { name: '隋国栋', alt: 'Guodong Sui', role: '合伙人' },
        { name: '苏瑜', alt: 'Sophia Su', role: '合伙人' }
      ]
    },
    contact: {
      label: '联系我们',
      title: '告诉我们，<br>你正在点燃什么',
      lede: '商业计划书、合作意向，或是尚未成形的想法，都欢迎留言。所有留言都由投资团队亲自阅读。',
      channels: [
        { label: '项目投递' },
        { label: '投资者关系' },
        { label: '媒体与合作' }
      ],
      form: {
        name: '姓名',
        company: '公司或机构',
        email: '邮箱',
        phone: '电话或微信（选填）',
        role: '我是',
        roles: ['创业者', '创作者', '投资人', '媒体及其他'],
        message: '想聊的事',
        consent: '提交即表示同意我们为回复之目的处理上述信息。',
        submit: '发送留言',
        sending: '发送中',
        errRequired: '请填写此项',
        errEmail: '请输入有效的邮箱地址',
        errShort: '请再多写一点',
        errSend: '发送失败，请稍后重试，或直接给我们发邮件。'
      },
      done: {
        title: '已收到，谢谢',
        text: '我们会认真阅读，并通过你留下的联系方式回复。',
        again: '继续留言',
        demo: '演示模式：尚未配置提交接口，这条留言没有被发送。'
      }
    },
    footer: {
      legal: '本网站内容仅供一般信息参考，不构成任何证券或基金份额的要约、招揽或投资建议。私募基金仅面向符合法律法规规定的合格投资者。投资有风险，过往业绩不预示未来表现。',
      rights: 'Spark Unlimited Investment. 保留所有权利。',
      top: '回到顶部'
    }
  },

  en: {
    htmlLang: 'en',
    meta: {
      title: 'Spark Unlimited Investment — Where sparks become unlimited',
      desc: 'Spark Unlimited Investment is an early and growth-stage venture capital firm backing advanced technology, advanced consumer and independent creators.'
    },
    a11y: { skip: 'Skip to content', menu: 'Menu', close: 'Close', lang: 'Switch language', nav: 'Primary' },
    nav: { about: 'About', mission: 'Mission', focus: 'Focus', team: 'Team', contact: 'Contact' },
    hero: {
      title: 'Where sparks<br>become unlimited',
      lede: 'Spark Unlimited Investment is an early and growth-stage venture capital firm. We invest at the moment of ignition, backing advanced technology, advanced consumer and independent creators with patient capital.',
      ledeShort: 'An early and growth-stage venture capital firm, investing at the moment of ignition.',
      cta: 'Get in touch',
      more: 'See our focus'
    },
    about: {
      label: 'About',
      statement: 'We believe every company that changes the world begins as a spark: a technology not yet proven, a product without a category name, a creator working alone.',
      p: 'Our job is to recognize it early, then bring capital, resources and patience for long enough that it can become unlimited.',
      stages: ['Spark', 'Ignite', 'Grow', 'Unlimited'],
      facts: [
        { label: 'Stage', value: 'Seed to Series B', note: 'As early as pre-product' },
        { label: 'Role', value: 'Lead and co-lead', note: 'Concentrated positions, with reserves to follow on' },
        { label: 'Horizon', value: 'Measured in decades', note: 'Unmoved by short-term noise' },
        { label: 'Decisions', value: 'Made by partners', note: 'No layers between you and the answer' }
      ]
    },
    mission: {
      label: 'Mission & Vision',
      missionLabel: 'Mission',
      mission: 'To give the faintest sparks what they need most: time, capital and conviction.',
      visionLabel: 'Vision',
      vision: 'A world with no ceiling on what is possible, where technology widens the frontier, products renew everyday life, and one person is enough to build something great.',
      principlesTitle: 'Principles',
      principles: [
        { title: 'Before consensus', text: 'The best opportunities appear before they have a name. When the data is thin, we decide on research and judgment.' },
        { title: 'Here for the long run', text: 'We think in decades. We take no credit in good times and keep our seat in hard ones.' },
        { title: 'Founders first', text: 'A company belongs to the people who build it. We bring resources and perspective, and leave the wheel with the founder.' },
        { title: 'Independent judgment', text: 'No chasing heat, no faith in labels. Every investment is researched and owned by a partner.' }
      ]
    },
    focus: {
      label: 'Investment Focus',
      title: 'Our allocation<br>is our conviction',
      lede: 'The portfolio is built 70 / 20 / 10. Its weight sits in frontier technology, with room kept for the products and brands that change how people live, and for individuals who create on their own.',
      areasLabel: 'Areas of interest',
      lookLabel: 'What we look for',
      items: [
        {
          title: 'Advanced Technology',
          desc: 'Frontier technology that pushes the boundary of the possible. The core of the portfolio.',
          areas: [
            { t: 'The AI value chain', d: 'Compute and chips, models and agents, AI applications' },
            { t: 'Future industries', d: 'Embodied AI and robotics, energy and new materials, life sciences and synthetic biology, space technology' }
          ],
          look: 'Teams with a defensible technical edge and a chance to define a new category. We are willing to come in before the product takes shape and stay through long R&D cycles.'
        },
        {
          title: 'Advanced Consumer',
          desc: 'Products and brands that change the way people live.',
          areas: ['Premium brands', 'Smart hardware', 'Advanced manufacturing', 'AI-native consumer products', 'Health & longevity', 'Culture & experiences'],
          look: 'Brands driven by product strength that can travel across cycles and borders. Great consumer companies are where new technology becomes everyday life.'
        },
        {
          title: 'Independent Creators',
          desc: 'People who create on their own strength.',
          areas: ['Independent artists', 'Independent musicians', 'Independent artisans', 'Independent game studios', 'Independent watchmakers', 'Independent developers', 'Content & knowledge creators'],
          look: 'The work comes before the company. We back creators with a distinct voice and an audience already listening, with flexible structures that follow the creator’s own pace.'
        }
      ]
    },
    team: {
      label: 'Team',
      title: 'The people accountable<br>for the call',
      lede: 'Partners work directly on research, decisions and post-investment support. The person you meet is the person who decides.',
      // 英文页只显示英文名。alt 要留空字符串，从中文切回英文时才会清掉那行小字
      members: [
        { name: 'Guodong Sui', alt: '', role: 'Partner' },
        { name: 'Sophia Su', alt: '', role: 'Partner' }
      ]
    },
    contact: {
      label: 'Contact',
      title: 'Tell us what<br>you are igniting',
      lede: 'A deck, a partnership idea, or a thought that has not taken shape yet: all welcome. Every message is read by the investment team.',
      channels: [
        { label: 'Pitches' },
        { label: 'Investor relations' },
        { label: 'Media & partnerships' }
      ],
      form: {
        name: 'Name',
        company: 'Company or organization',
        email: 'Email',
        phone: 'Phone / WeChat (optional)',
        role: 'I am a',
        roles: ['Founder', 'Creator', 'Investor', 'Media / other'],
        message: 'What would you like to discuss?',
        consent: 'By submitting, you agree that we may process this information in order to reply.',
        submit: 'Send message',
        sending: 'Sending',
        errRequired: 'This field is required',
        errEmail: 'Please enter a valid email address',
        errShort: 'Please tell us a little more',
        errSend: 'Something went wrong. Please try again, or email us directly.'
      },
      done: {
        title: 'Received, thank you',
        text: 'We will read it carefully and reply using the contact details you left.',
        again: 'Send another',
        demo: 'Demo mode: no form endpoint is configured, so this message was not sent.'
      }
    },
    footer: {
      legal: 'The content of this website is for general information only and does not constitute an offer, solicitation or investment advice in respect of any security or fund interest. Private funds are available only to qualified investors as defined by applicable law. Investing involves risk; past performance is not indicative of future results.',
      rights: 'Spark Unlimited Investment. All rights reserved.',
      top: 'Back to top'
    }
  }
};
