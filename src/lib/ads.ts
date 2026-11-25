// A-ADS 广告单元配置
//
// 单元 ID 全部待填：先在 A-ADS 后台 (https://a-ads.com) 为本站创建广告单元，
// 把返回的数字 ID 填到下面对应位置。留空字符串 = 该位置不展示广告。
// 尺寸建议：三个位置都用 Adaptive（自适应，移动端友好）；
// 如只想投桌面端横幅，可把 size 改成 '728x90'（在引用处传 size 参数）。
export const AD_UNITS = {
  /** 首页 Hero 下方横幅（首屏下方，不遮挡工具入口） */
  'home-top': '2463191',
  /** 首页底部（分类列表下方、页脚上方） */
  'home-bottom': '2463192',
  /** 工具页底部（工具内容下方，不干扰工具操作区） */
  'tool-bottom': '2463193',
} as const

export type AdSlotName = keyof typeof AD_UNITS
