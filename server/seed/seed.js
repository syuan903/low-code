// 种子数据脚本：随机生成 100 份不同主题的问卷及配套答卷写入 MongoDB。
// 运行方式：npm run seed （需本地 MongoDB 环境）

import { connectDB, surveys, answers, counters, getNextId } from "../db/mongo.js";
import {
  makeTextNote,
  makeChoice,
  makeTextInput,
  makeRate,
  makeDateTime,
} from "./buildSurvey.js";

// ---------------- 随机工具 ----------------
// 返回 [min, max] 闭区间内的随机整数
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// 从数组中随机取一个元素
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
// 从数组中随机取 n 个不重复元素
function pickSome(arr, n) {
  const copy = [...arr];
  const result = [];
  while (result.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

// ---------------- 主题库（共 30 个主题，>= 25）----------------
// 每个主题包含：标题前缀、欢迎语、以及一组备选题目（题型 + 文案 + 选项）。
// 题型说明：single/multi/option = 选择类；text = 文本；rate = 评分；date = 日期。
const THEMES = [
  {
    name: "大学生消费习惯",
    welcome: "本问卷旨在了解当代大学生的日常消费习惯，您的回答将完全匿名。",
    questions: [
      { type: "single", title: "你每月生活费大致是多少？", options: ["1000元以下", "1000-1500元", "1500-2000元", "2000元以上"] },
      { type: "multi", title: "你的主要消费支出有哪些？", options: ["餐饮", "购物", "娱乐", "学习资料", "交通", "人际交往"] },
      { type: "option", title: "你最常用的支付方式是？", options: ["微信", "支付宝", "现金", "银行卡"] },
      { type: "rate", title: "你对自己的消费规划满意度如何？" },
      { type: "text", title: "你有哪些省钱小妙招？" },
    ],
  },
  {
    name: "员工满意度",
    welcome: "感谢您参与本次员工满意度调查，帮助我们打造更好的工作环境。",
    questions: [
      { type: "rate", title: "你对目前的薪酬待遇满意度如何？" },
      { type: "rate", title: "你对团队协作氛围的评价？" },
      { type: "single", title: "你认为目前最需要改善的是？", options: ["薪资", "晋升通道", "工作强度", "办公环境"] },
      { type: "multi", title: "你最看重公司的哪些福利？", options: ["五险一金", "带薪年假", "弹性工作", "团建活动", "培训机会"] },
      { type: "text", title: "你对公司管理有何建议？" },
    ],
  },
  {
    name: "产品体验反馈",
    welcome: "您的产品使用反馈对我们至关重要，请花几分钟完成本问卷。",
    questions: [
      { type: "rate", title: "你对产品整体体验的评分？" },
      { type: "single", title: "你使用本产品的频率？", options: ["每天", "每周几次", "偶尔", "第一次使用"] },
      { type: "multi", title: "你最常使用哪些功能？", options: ["核心功能", "数据统计", "分享", "消息通知", "个性化设置"] },
      { type: "single", title: "你是否愿意推荐给朋友？", options: ["非常愿意", "比较愿意", "一般", "不愿意"] },
      { type: "text", title: "你希望增加哪些新功能？" },
    ],
  },
  {
    name: "健康生活方式",
    welcome: "本调查关注大众的健康生活方式，期待您的真实分享。",
    questions: [
      { type: "single", title: "你平均每天睡眠时长？", options: ["6小时以下", "6-7小时", "7-8小时", "8小时以上"] },
      { type: "multi", title: "你平时会做哪些运动？", options: ["跑步", "游泳", "瑜伽", "球类", "健身房", "几乎不运动"] },
      { type: "rate", title: "你对自己的健康状况评分？" },
      { type: "single", title: "你三餐是否规律？", options: ["非常规律", "比较规律", "不太规律", "很不规律"] },
      { type: "date", title: "你最近一次体检的日期？" },
    ],
  },
  {
    name: "在线教育评价",
    welcome: "本问卷用于评估在线教育平台的使用体验，感谢您的参与。",
    questions: [
      { type: "rate", title: "你对在线课程质量的评分？" },
      { type: "single", title: "你最常学习的时间段？", options: ["早晨", "下午", "晚上", "深夜"] },
      { type: "multi", title: "你认为在线学习的优势有哪些？", options: ["时间灵活", "节省通勤", "可回放", "资源丰富", "价格实惠"] },
      { type: "single", title: "你更偏好哪种课程形式？", options: ["直播", "录播", "图文", "混合式"] },
      { type: "text", title: "你对在线教育平台有何改进建议？" },
    ],
  },
  {
    name: "旅游偏好",
    welcome: "本问卷调查大众的旅游出行偏好，您的回答将助力我们优化服务。",
    questions: [
      { type: "single", title: "你偏好的旅游类型？", options: ["自然风光", "历史人文", "美食之旅", "休闲度假", "探险户外"] },
      { type: "multi", title: "出行时你最看重什么？", options: ["性价比", "交通便利", "住宿舒适", "景点丰富", "美食"] },
      { type: "single", title: "你常用的出行方式？", options: ["飞机", "高铁", "自驾", "跟团"] },
      { type: "rate", title: "你对最近一次旅行的满意度？" },
      { type: "date", title: "你计划下一次出行的日期？" },
    ],
  },
  {
    name: "餐饮口味",
    welcome: "本问卷了解大家的餐饮口味偏好，欢迎踊跃作答。",
    questions: [
      { type: "single", title: "你最喜欢的菜系？", options: ["川菜", "粤菜", "湘菜", "鲁菜", "西餐", "日料"] },
      { type: "multi", title: "你能接受的口味有哪些？", options: ["麻辣", "清淡", "酸甜", "咸鲜", "重油"] },
      { type: "single", title: "你一周外出就餐频率？", options: ["几乎不", "1-2次", "3-5次", "几乎每天"] },
      { type: "rate", title: "你对本地餐饮整体水平的评分？" },
      { type: "text", title: "推荐一家你最爱的餐厅吧？" },
    ],
  },
  {
    name: "阅读习惯",
    welcome: "本调查关注大众的阅读习惯，感谢您分享您的阅读世界。",
    questions: [
      { type: "single", title: "你更偏好哪种阅读形式？", options: ["纸质书", "电子书", "有声书", "看情况"] },
      { type: "multi", title: "你常读的书籍类型？", options: ["文学", "历史", "科技", "经管", "心理", "小说"] },
      { type: "single", title: "你平均每月读几本书？", options: ["0本", "1-2本", "3-5本", "5本以上"] },
      { type: "rate", title: "你对自己阅读量的满意度？" },
      { type: "text", title: "推荐一本对你影响最大的书？" },
    ],
  },
  {
    name: "健身调查",
    welcome: "本问卷调查大众的健身现状与需求，期待您的参与。",
    questions: [
      { type: "single", title: "你每周健身频率？", options: ["不健身", "1-2次", "3-4次", "5次以上"] },
      { type: "multi", title: "你的健身目标是？", options: ["增肌", "减脂", "塑形", "保持健康", "缓解压力"] },
      { type: "single", title: "你更倾向哪种健身方式？", options: ["健身房", "居家锻炼", "户外运动", "团课"] },
      { type: "rate", title: "你对自己当前体能状态的评分？" },
      { type: "text", title: "你在健身中遇到的最大困难是？" },
    ],
  },
  {
    name: "职业规划",
    welcome: "本问卷关注职场人士的职业规划现状，您的回答将完全保密。",
    questions: [
      { type: "single", title: "你目前的职业发展阶段？", options: ["应届/实习", "1-3年", "3-5年", "5年以上"] },
      { type: "multi", title: "你认为职业发展最需要的能力？", options: ["专业技能", "沟通能力", "领导力", "学习能力", "抗压能力"] },
      { type: "single", title: "未来三年你的主要目标？", options: ["升职加薪", "转行", "深造", "创业", "保持现状"] },
      { type: "rate", title: "你对当前职业发展的满意度？" },
      { type: "text", title: "描述一下你的理想职业状态？" },
    ],
  },
  {
    name: "心理健康",
    welcome: "本问卷关注大众的心理健康状况，您的回答将被严格保密。",
    questions: [
      { type: "rate", title: "你最近一周的整体情绪状态评分？" },
      { type: "single", title: "你感到压力时通常如何应对？", options: ["运动", "倾诉", "独处", "娱乐", "睡觉"] },
      { type: "multi", title: "哪些因素会给你带来压力？", options: ["工作学习", "经济", "人际关系", "健康", "未来"] },
      { type: "single", title: "你近期的睡眠质量如何？", options: ["很好", "一般", "较差", "很差"] },
      { type: "text", title: "你有什么想倾诉的话吗？" },
    ],
  },
  {
    name: "网购体验",
    welcome: "本问卷调查大众的网购体验，感谢您的宝贵反馈。",
    questions: [
      { type: "single", title: "你最常用的购物平台？", options: ["淘宝", "京东", "拼多多", "抖音", "其他"] },
      { type: "multi", title: "网购时你最关注什么？", options: ["价格", "质量", "评价", "物流", "售后", "品牌"] },
      { type: "single", title: "你每月网购频率？", options: ["很少", "几次", "每周都买", "几乎每天"] },
      { type: "rate", title: "你对最近一次网购的满意度？" },
      { type: "text", title: "你遇到过哪些网购烦恼？" },
    ],
  },
  {
    name: "社交媒体使用",
    welcome: "本问卷调查大众的社交媒体使用情况，欢迎如实填写。",
    questions: [
      { type: "single", title: "你每天使用社交媒体的时长？", options: ["1小时以下", "1-3小时", "3-5小时", "5小时以上"] },
      { type: "multi", title: "你常用的社交平台？", options: ["微信", "微博", "抖音", "小红书", "B站", "知乎"] },
      { type: "single", title: "你使用社交媒体的主要目的？", options: ["社交", "获取资讯", "娱乐", "学习", "工作"] },
      { type: "rate", title: "社交媒体对你生活的积极影响评分？" },
      { type: "text", title: "你认为社交媒体的最大问题是？" },
    ],
  },
  {
    name: "环保意识",
    welcome: "本问卷调查大众的环保意识与行为，期待您的支持。",
    questions: [
      { type: "rate", title: "你对自己环保行为的评分？" },
      { type: "multi", title: "你践行过哪些环保行为？", options: ["垃圾分类", "节水节电", "绿色出行", "减少一次性用品", "二手交易"] },
      { type: "single", title: "你出行优先选择？", options: ["步行/骑行", "公共交通", "私家车", "看情况"] },
      { type: "single", title: "你是否愿意为环保产品支付溢价？", options: ["非常愿意", "看情况", "不太愿意", "不愿意"] },
      { type: "text", title: "你对环保有什么倡议？" },
    ],
  },
  {
    name: "交通出行",
    welcome: "本问卷调查城市居民的交通出行方式，感谢您的参与。",
    questions: [
      { type: "single", title: "你日常通勤主要方式？", options: ["地铁", "公交", "自驾", "骑行", "步行"] },
      { type: "single", title: "你单程通勤时长？", options: ["30分钟以内", "30-60分钟", "1-1.5小时", "1.5小时以上"] },
      { type: "multi", title: "你认为城市交通有哪些问题？", options: ["拥堵", "停车难", "公交班次少", "票价高", "换乘不便"] },
      { type: "rate", title: "你对本地交通便利度的评分？" },
      { type: "text", title: "你对改善城市交通有何建议？" },
    ],
  },
  {
    name: "影视娱乐偏好",
    welcome: "本问卷了解大众的影视娱乐偏好，欢迎踊跃作答。",
    questions: [
      { type: "multi", title: "你喜欢的影视类型？", options: ["科幻", "悬疑", "爱情", "喜剧", "动作", "纪录片"] },
      { type: "single", title: "你常用的观影平台？", options: ["腾讯视频", "爱奇艺", "优酷", "B站", "影院"] },
      { type: "single", title: "你每周观影时长？", options: ["2小时以下", "2-5小时", "5-10小时", "10小时以上"] },
      { type: "rate", title: "你对近期影视作品质量的评分？" },
      { type: "text", title: "推荐一部你近期最爱的作品？" },
    ],
  },
  {
    name: "家庭理财",
    welcome: "本问卷调查家庭理财观念与方式，您的回答将完全匿名。",
    questions: [
      { type: "single", title: "你家庭主要的理财方式？", options: ["银行存款", "基金", "股票", "保险", "房产"] },
      { type: "multi", title: "你的理财目标有哪些？", options: ["子女教育", "养老", "购房", "应急储备", "财富增值"] },
      { type: "single", title: "你的风险偏好？", options: ["保守型", "稳健型", "平衡型", "进取型"] },
      { type: "rate", title: "你对家庭财务状况的满意度？" },
      { type: "text", title: "你有哪些理财心得？" },
    ],
  },
  {
    name: "宠物养护",
    welcome: "本问卷调查宠物主人的养护习惯，感谢爱宠人士的参与。",
    questions: [
      { type: "single", title: "你饲养的宠物类型？", options: ["猫", "狗", "鱼", "鸟", "小宠", "暂未饲养"] },
      { type: "multi", title: "你在宠物身上的主要花费？", options: ["食物", "医疗", "用品", "美容", "玩具"] },
      { type: "single", title: "你每月宠物开销？", options: ["200元以下", "200-500元", "500-1000元", "1000元以上"] },
      { type: "rate", title: "你对当地宠物服务的评分？" },
      { type: "text", title: "分享一个你和宠物的暖心故事？" },
    ],
  },
  {
    name: "咖啡消费",
    welcome: "本问卷调查大众的咖啡消费习惯，欢迎咖啡爱好者参与。",
    questions: [
      { type: "single", title: "你每天喝几杯咖啡？", options: ["不喝", "1杯", "2杯", "3杯及以上"] },
      { type: "multi", title: "你常喝的咖啡种类？", options: ["美式", "拿铁", "卡布奇诺", "摩卡", "手冲", "速溶"] },
      { type: "single", title: "你购买咖啡的主要渠道？", options: ["连锁咖啡店", "便利店", "自己冲", "外卖"] },
      { type: "rate", title: "你对常喝咖啡品牌的评分？" },
      { type: "text", title: "你最爱的一款咖啡是？" },
    ],
  },
  {
    name: "运动品牌偏好",
    welcome: "本问卷调查消费者对运动品牌的偏好，感谢您的参与。",
    questions: [
      { type: "single", title: "你最常购买的运动品牌？", options: ["Nike", "Adidas", "李宁", "安踏", "其他"] },
      { type: "multi", title: "你购买运动产品时关注什么？", options: ["设计", "舒适度", "价格", "品牌", "功能性"] },
      { type: "single", title: "你每年购买运动装备的预算？", options: ["500元以下", "500-1000元", "1000-2000元", "2000元以上"] },
      { type: "rate", title: "你对常购品牌的满意度？" },
      { type: "text", title: "你期待运动品牌有哪些创新？" },
    ],
  },
  {
    name: "智能家居",
    welcome: "本问卷调查智能家居的普及与使用情况，欢迎填写。",
    questions: [
      { type: "multi", title: "你家中有哪些智能设备？", options: ["智能音箱", "扫地机器人", "智能门锁", "智能灯", "智能摄像头", "暂无"] },
      { type: "single", title: "你购买智能家居的主要原因？", options: ["便利", "安全", "节能", "新潮", "其他"] },
      { type: "single", title: "你对智能家居的接受程度？", options: ["非常喜欢", "比较喜欢", "一般", "不感兴趣"] },
      { type: "rate", title: "你对现有智能设备体验的评分？" },
      { type: "text", title: "你希望未来智能家居解决什么问题？" },
    ],
  },
  {
    name: "远程办公",
    welcome: "本问卷调查远程办公的体验与效率，您的回答将保密。",
    questions: [
      { type: "single", title: "你目前的办公模式？", options: ["全远程", "混合办公", "全坐班", "灵活安排"] },
      { type: "multi", title: "远程办公的优势在哪？", options: ["节省通勤", "时间灵活", "环境舒适", "兼顾家庭", "效率提升"] },
      { type: "multi", title: "远程办公的挑战是？", options: ["沟通不畅", "自律困难", "孤独感", "设备问题", "加班界限模糊"] },
      { type: "rate", title: "你对远程办公效率的评分？" },
      { type: "text", title: "你有哪些提升远程效率的方法？" },
    ],
  },
  {
    name: "二手交易",
    welcome: "本问卷调查大众的二手交易习惯，感谢您的参与。",
    questions: [
      { type: "single", title: "你常用的二手交易平台？", options: ["闲鱼", "转转", "线下市场", "朋友圈", "不参与"] },
      { type: "multi", title: "你交易过哪些二手物品？", options: ["电子产品", "服饰", "图书", "家具", "游戏装备"] },
      { type: "single", title: "你参与二手交易的主要原因？", options: ["省钱", "环保", "处理闲置", "淘到好物"] },
      { type: "rate", title: "你对二手交易体验的评分？" },
      { type: "text", title: "你在二手交易中有哪些顾虑？" },
    ],
  },
  {
    name: "短视频使用",
    welcome: "本问卷调查大众的短视频使用习惯，欢迎如实填写。",
    questions: [
      { type: "single", title: "你每天观看短视频的时长？", options: ["30分钟以内", "30分钟-1小时", "1-3小时", "3小时以上"] },
      { type: "multi", title: "你常看的短视频内容？", options: ["搞笑", "知识", "美食", "旅行", "影视", "带货"] },
      { type: "single", title: "你常用的短视频平台？", options: ["抖音", "快手", "视频号", "B站", "小红书"] },
      { type: "rate", title: "短视频给你带来的价值评分？" },
      { type: "text", title: "你认为短视频对生活的影响是？" },
    ],
  },
  {
    name: "城市生活满意度",
    welcome: "本问卷调查居民对城市生活的满意度，期待您的真实反馈。",
    questions: [
      { type: "rate", title: "你对所在城市生活的整体满意度？" },
      { type: "multi", title: "你最满意城市的哪些方面？", options: ["交通", "医疗", "教育", "环境", "就业", "文娱"] },
      { type: "single", title: "你在这座城市居住多久了？", options: ["1年以内", "1-3年", "3-5年", "5年以上"] },
      { type: "single", title: "你是否打算长期定居于此？", options: ["是", "否", "未确定"] },
      { type: "text", title: "你希望城市在哪些方面改进？" },
    ],
  },
  {
    name: "电商直播",
    welcome: "本问卷调查大众对电商直播的看法，感谢您的参与。",
    questions: [
      { type: "single", title: "你看直播购物的频率？", options: ["从不", "偶尔", "经常", "几乎每天"] },
      { type: "multi", title: "你在直播间常买什么？", options: ["美妆", "服饰", "食品", "数码", "家居"] },
      { type: "single", title: "吸引你下单的主要因素？", options: ["价格优惠", "主播推荐", "限时秒杀", "产品演示"] },
      { type: "rate", title: "你对直播购物体验的评分？" },
      { type: "text", title: "你对直播带货有什么看法？" },
    ],
  },
  {
    name: "校园生活",
    welcome: "本问卷调查在校学生的校园生活状况，您的回答将匿名处理。",
    questions: [
      { type: "single", title: "你对校园生活的整体感受？", options: ["很充实", "比较充实", "一般", "比较空虚"] },
      { type: "multi", title: "你课余时间主要做什么？", options: ["社团活动", "兼职", "学习", "运动", "游戏", "社交"] },
      { type: "single", title: "你认为校园最需改善的？", options: ["食堂", "宿舍", "图书馆", "运动设施", "网络"] },
      { type: "rate", title: "你对学校服务的满意度？" },
      { type: "text", title: "你对校园生活有什么期待？" },
    ],
  },
  {
    name: "理想居住环境",
    welcome: "本问卷调查大众对理想居住环境的期待，欢迎填写。",
    questions: [
      { type: "single", title: "你理想的居住城市规模？", options: ["一线城市", "新一线", "二三线", "县城/乡村"] },
      { type: "multi", title: "你选择住所时最看重？", options: ["交通", "学区", "环境", "配套", "价格", "安全"] },
      { type: "single", title: "你偏好的居住形式？", options: ["高层公寓", "多层住宅", "别墅", "loft"] },
      { type: "rate", title: "你对当前居住环境的满意度？" },
      { type: "text", title: "描述一下你的理想家？" },
    ],
  },
  {
    name: "数字支付习惯",
    welcome: "本问卷调查大众的数字支付习惯，感谢您的参与。",
    questions: [
      { type: "multi", title: "你常用的支付方式？", options: ["微信", "支付宝", "云闪付", "银行卡", "数字人民币", "现金"] },
      { type: "single", title: "你日常携带现金的频率？", options: ["从不", "很少", "偶尔", "经常"] },
      { type: "single", title: "你对移动支付安全的态度？", options: ["很放心", "比较放心", "有些担忧", "很担忧"] },
      { type: "rate", title: "你对移动支付便利度的评分？" },
      { type: "text", title: "你在使用数字支付时有何顾虑？" },
    ],
  },
];

// 选择类题型对应的业务组件 name
const CHOICE_NAME = {
  single: "single-select",
  multi: "multi-select",
  option: "option-select",
};

// 文本题的合理随机短文本
const TEXT_ANSWERS = [
  "整体感觉不错，符合预期。",
  "希望能够进一步改进体验。",
  "比较满意，会继续关注。",
  "还有提升空间，加油。",
  "非常喜欢，已经推荐给朋友了。",
  "有些细节需要优化。",
  "总体来说性价比很高。",
  "暂时没有特别的想法。",
  "期待更多新功能上线。",
  "服务态度很好，点赞。",
];

// 生成一个随机日期字符串（近三年内）
function randomDateString() {
  const start = new Date(2023, 0, 1).getTime();
  const end = Date.now();
  const t = start + Math.random() * (end - start);
  const d = new Date(t);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 依据某道题目定义，构造对应的 com 对象
function buildCom(q) {
  switch (q.type) {
    case "single":
    case "multi":
    case "option":
      return makeChoice(CHOICE_NAME[q.type], q.title, q.options);
    case "text":
      return makeTextInput(q.title);
    case "rate":
      return makeRate(q.title);
    case "date":
      return makeDateTime(q.title);
    default:
      return makeTextInput(q.title);
  }
}

// 依据某道题目定义与已构造的 com，生成一个随机答案值
function buildAnswer(q) {
  switch (q.type) {
    case "single":
    case "option":
      return pick(q.options);
    case "multi":
      // 多选随机取 1~N 个
      return pickSome(q.options, randInt(1, Math.min(3, q.options.length)));
    case "rate":
      return randInt(1, 5);
    case "date":
      return randomDateString();
    case "text":
    default:
      return pick(TEXT_ANSWERS);
  }
}

// 生成一份问卷（含 coms）及其题目定义列表（用于后续生成答卷）
function buildOneSurvey(theme, seq) {
  // 随机抽取 4~8 道题（主题题库不足时允许重复）
  const count = randInt(4, 8);
  const qPool = theme.questions;
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(pick(qPool));
  }

  // 第一个 com 为 text-note（问卷标题/欢迎语），不计入题目数量
  const coms = [
    makeTextNote(`${theme.name}调查问卷（第${seq}期）`, theme.welcome),
    ...questions.map(buildCom),
  ];

  const now = Date.now();
  const survey = {
    createDate: now,
    updateDate: now,
    title: `${theme.name}调查问卷（第${seq}期）`,
    surveyCount: questions.length, // 仅统计题型组件数量
    coms,
  };
  return { survey, questions };
}

// 为某份问卷生成若干随机答卷
function buildAnswersFor(quizId, questions, n) {
  const docs = [];
  for (let i = 0; i < n; i++) {
    const answerObj = {};
    // 题号从 1 开始按题型组件顺序编号
    questions.forEach((q, idx) => {
      answerObj[idx + 1] = buildAnswer(q);
    });
    docs.push({
      quizId, // 关联 survey 的数字 id，便于后续 RAG 按 surveyId 查询
      answers: answerObj,
      createDate: Date.now() - randInt(0, 1000 * 60 * 60 * 24 * 30),
    });
  }
  return docs;
}

// ---------------- 主流程 ----------------
async function main() {
  await connectDB();

  // 清空相关集合，保证脚本可重复运行
  await Promise.all([
    surveys().deleteMany({}),
    answers().deleteMany({}),
    counters().deleteMany({}),
  ]);
  console.log("已清空 surveys / answers / counters 集合");

  const TOTAL = 100;
  // 记录每个主题已使用次数，用于标题序号区分
  const themeSeq = {};
  let totalAnswers = 0;

  for (let i = 0; i < TOTAL; i++) {
    const theme = pick(THEMES);
    themeSeq[theme.name] = (themeSeq[theme.name] || 0) + 1;
    const seq = themeSeq[theme.name];

    const { survey, questions } = buildOneSurvey(theme, seq);
    const id = await getNextId("survey");
    survey.id = id;
    await surveys().insertOne(survey);

    // 每份问卷生成 5~20 份答卷
    const answerCount = randInt(5, 20);
    const answerDocs = buildAnswersFor(id, questions, answerCount);
    if (answerDocs.length) {
      await answers().insertMany(answerDocs);
    }
    totalAnswers += answerDocs.length;

    console.log(
      `[${i + 1}/${TOTAL}] 已生成问卷 id=${id} 《${survey.title}》题目${survey.surveyCount}道，答卷${answerDocs.length}份`
    );
  }

  console.log("----------------------------------------");
  console.log(`种子数据生成完成：问卷 ${TOTAL} 份，答卷 ${totalAnswers} 份`);
  process.exit(0);
}

main().catch((err) => {
  console.error("种子数据生成失败：", err);
  process.exit(1);
});
