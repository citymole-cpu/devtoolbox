import { useState, useMemo } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { Search, ShieldAlert, ShieldCheck, Smartphone, Layers } from 'lucide-react';

interface AndroidPerm {
  permission: string;
  name: string;
  level: 'normal' | 'dangerous' | 'signature' | 'special';
  group: string;
  description: string;
  addedIn: string;
}

const PERMISSIONS: AndroidPerm[] = [
  // 存储
  {
    permission: 'android.permission.READ_EXTERNAL_STORAGE',
    name: '读取外部存储',
    level: 'dangerous',
    group: 'STORAGE',
    description: '允许应用程序读取外部存储设备（如 SD 卡）上的文件内容。',
    addedIn: 'API 16 (Android 4.1)'
  },
  {
    permission: 'android.permission.WRITE_EXTERNAL_STORAGE',
    name: '写入外部存储',
    level: 'dangerous',
    group: 'STORAGE',
    description: '允许应用程序写入外部存储设备，在 Android 10+ 需遵循分区存储规范。',
    addedIn: 'API 4 (Android 1.6)'
  },
  {
    permission: 'android.permission.READ_MEDIA_IMAGES',
    name: '读取照片/图片媒体库',
    level: 'dangerous',
    group: 'STORAGE',
    description: 'Android 13+ 细化媒体权限：允许读取用户图库照片和图片。',
    addedIn: 'API 33 (Android 13)'
  },
  {
    permission: 'android.permission.READ_MEDIA_VIDEO',
    name: '读取视频媒体库',
    level: 'dangerous',
    group: 'STORAGE',
    description: 'Android 13+ 细化媒体权限：允许读取用户存储中的视频文件。',
    addedIn: 'API 33 (Android 13)'
  },
  {
    permission: 'android.permission.READ_MEDIA_AUDIO',
    name: '读取音频媒体库',
    level: 'dangerous',
    group: 'STORAGE',
    description: 'Android 13+ 细化媒体权限：允许读取用户存储中的音乐与音频文件。',
    addedIn: 'API 33 (Android 13)'
  },
  {
    permission: 'android.permission.MANAGE_EXTERNAL_STORAGE',
    name: '所有文件访问管理权限',
    level: 'special',
    group: 'STORAGE',
    description: 'Android 11+ 用于文件管理器/杀毒软件等全面管理所有文件的特殊权限。',
    addedIn: 'API 30 (Android 11)'
  },

  // 位置
  {
    permission: 'android.permission.ACCESS_FINE_LOCATION',
    name: '精准位置 (GPS/北斗)',
    level: 'dangerous',
    group: 'LOCATION',
    description: '允许应用通过 GPS、GLONASS、北斗及蜂窝基站获取高精度的用户物理位置。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.ACCESS_COARSE_LOCATION',
    name: '大致位置 (基站/WiFi)',
    level: 'dangerous',
    group: 'LOCATION',
    description: '允许应用通过基站与 Wi-Fi 热点获取粗略位置（精度在几百米左右）。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.ACCESS_BACKGROUND_LOCATION',
    name: '后台始终访问位置',
    level: 'dangerous',
    group: 'LOCATION',
    description: 'Android 10+ 引入：允许应用在后台未运行或屏幕熄灭时持续获取位置。',
    addedIn: 'API 29 (Android 10)'
  },

  // 相机与麦克风
  {
    permission: 'android.permission.CAMERA',
    name: '相机/拍照录像',
    level: 'dangerous',
    group: 'CAMERA',
    description: '允许应用调用系统摄像头拍摄照片或录制视频。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.RECORD_AUDIO',
    name: '录音/麦克风访问',
    level: 'dangerous',
    group: 'MICROPHONE',
    description: '允许应用捕获音频输入（麦克风录音）。',
    addedIn: 'API 1'
  },

  // 联系人与日历
  {
    permission: 'android.permission.READ_CONTACTS',
    name: '读取联系人',
    level: 'dangerous',
    group: 'CONTACTS',
    description: '允许应用读取用户的通讯录联系人列表及头像、备注。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.WRITE_CONTACTS',
    name: '修改/新增联系人',
    level: 'dangerous',
    group: 'CONTACTS',
    description: '允许应用修改、新建或删除用户的联系人数据。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.READ_CALENDAR',
    name: '读取日历活动',
    level: 'dangerous',
    group: 'CALENDAR',
    description: '允许应用读取用户日历日程与事件安排。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.WRITE_CALENDAR',
    name: '新建/编辑日历日程',
    level: 'dangerous',
    group: 'CALENDAR',
    description: '允许应用添加、修改或删除日历日程及提醒。',
    addedIn: 'API 1'
  },

  // 电话与短信
  {
    permission: 'android.permission.READ_PHONE_STATE',
    name: '读取电话状态/设备信息',
    level: 'dangerous',
    group: 'PHONE',
    description: '读取电话状态，包括蜂窝网络信息、正在通话状态、SIM卡状态等。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.CALL_PHONE',
    name: '直接拨打电话',
    level: 'dangerous',
    group: 'PHONE',
    description: '允许应用无需打开拨号器用户确认直接发起外拨电话。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.READ_CALL_LOG',
    name: '读取通话记录',
    level: 'dangerous',
    group: 'CALL_LOG',
    description: '允许应用查看未接来电、已拨电话、通话时长等历史通话记录。',
    addedIn: 'API 16 (Android 4.1)'
  },
  {
    permission: 'android.permission.SEND_SMS',
    name: '发送短信',
    level: 'dangerous',
    group: 'SMS',
    description: '允许应用直接发送 SMS 短信，可能产生资费。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.READ_SMS',
    name: '读取短信内容',
    level: 'dangerous',
    group: 'SMS',
    description: '允许应用读取收件箱、发件箱中的 SMS 短信（常用于自动填充验证码）。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.RECEIVE_SMS',
    name: '接收短信广播',
    level: 'dangerous',
    group: 'SMS',
    description: '允许应用监听并处理新收到的 SMS 文本短信。',
    addedIn: 'API 1'
  },

  // 通知与通知栏
  {
    permission: 'android.permission.POST_NOTIFICATIONS',
    name: '发送系统通知',
    level: 'dangerous',
    group: 'NOTIFICATIONS',
    description: 'Android 13+ 引入：应用向通知栏发送弹窗通知必须申请的用户授权。',
    addedIn: 'API 33 (Android 13)'
  },

  // 基础网络与网络状态 (Normal)
  {
    permission: 'android.permission.INTERNET',
    name: '访问互联网',
    level: 'normal',
    group: 'NETWORK',
    description: '允许应用程序打开网络套接字，发起 HTTP/HTTPS 请求与连接网络。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.ACCESS_NETWORK_STATE',
    name: '获取网络连接状态',
    level: 'normal',
    group: 'NETWORK',
    description: '允许应用查看当前的网络连接类型（Wi-Fi、蜂窝、移动数据是否开启）。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.ACCESS_WIFI_STATE',
    name: '获取 Wi-Fi 状态信息',
    level: 'normal',
    group: 'NETWORK',
    description: '允许应用查看 Wi-Fi 连接状态及当前 SSID、MAC 地址等。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.CHANGE_WIFI_STATE',
    name: '改变 Wi-Fi 连接状态',
    level: 'normal',
    group: 'NETWORK',
    description: '允许应用开启或关闭 Wi-Fi，以及配置或断开接入点。',
    addedIn: 'API 1'
  },

  // 硬件与系统辅助
  {
    permission: 'android.permission.VIBRATE',
    name: '控制手机振动器',
    level: 'normal',
    group: 'HARDWARE',
    description: '允许应用程序控制马达振动器产生震动反馈。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.WAKE_LOCK',
    name: '唤醒锁/防止休眠',
    level: 'normal',
    group: 'SYSTEM',
    description: '允许使用 PowerManager 保持处理器在锁屏或熄屏后继续运行任务。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.RECEIVE_BOOT_COMPLETED',
    name: '开机自启监听',
    level: 'normal',
    group: 'SYSTEM',
    description: '允许应用接收系统启动完成广播 (ACTION_BOOT_COMPLETED)。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.FOREGROUND_SERVICE',
    name: '运行前台保活服务',
    level: 'normal',
    group: 'SYSTEM',
    description: 'Android 9+ 引入：允许应用程序创建前台持续驻留服务（需带前台通知）。',
    addedIn: 'API 28 (Android 9)'
  },
  {
    permission: 'android.permission.SYSTEM_ALERT_WINDOW',
    name: '悬浮窗/顶层画中画显示',
    level: 'special',
    group: 'DISPLAY',
    description: '允许应用在所有其它应用界面顶层绘制全局悬浮球、悬浮窗或遮罩。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.REQUEST_INSTALL_PACKAGES',
    name: '安装未知来源 APK',
    level: 'special',
    group: 'PACKAGE',
    description: 'Android 8+ 引入：允许应用调起系统包管理器安装 APK 安装包文件。',
    addedIn: 'API 26 (Android 8.0)'
  },
  {
    permission: 'android.permission.BLUETOOTH',
    name: '蓝牙连接与通讯',
    level: 'normal',
    group: 'BLUETOOTH',
    description: '允许应用连接已配对的蓝牙设备。',
    addedIn: 'API 1'
  },
  {
    permission: 'android.permission.BLUETOOTH_SCAN',
    name: '蓝牙低功耗扫描 BLE',
    level: 'dangerous',
    group: 'BLUETOOTH',
    description: 'Android 12+ 引入：允许应用搜寻附近的蓝牙外设，无需申请粗略地理位置。',
    addedIn: 'API 31 (Android 12)'
  },
  {
    permission: 'android.permission.BLUETOOTH_CONNECT',
    name: '蓝牙设备连接配对',
    level: 'dangerous',
    group: 'BLUETOOTH',
    description: 'Android 12+ 引入：允许应用与已配对的蓝牙设备通信建立连接。',
    addedIn: 'API 31 (Android 12)'
  },
  {
    permission: 'android.permission.USE_BIOMETRIC',
    name: '指纹/人脸生物识别',
    level: 'normal',
    group: 'HARDWARE',
    description: '允许应用使用系统提供的生物特征（指纹、面容等）进行身份验证。',
    addedIn: 'API 28 (Android 9)'
  }
];

export default function AndroidPermissions() {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const groups = useMemo(() => {
    const set = new Set(PERMISSIONS.map(p => p.group));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PERMISSIONS.filter(p => {
      const matchText = !q || p.permission.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchGroup = selectedGroup === 'ALL' || p.group === selectedGroup;
      const matchLevel = selectedLevel === 'ALL' || p.level === selectedLevel;
      return matchText && matchGroup && matchLevel;
    });
  }, [search, selectedGroup, selectedLevel]);

  const levelBadges = {
    dangerous: { label: '运行时危险权限 (Dangerous)', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
    normal: { label: '普通权限 (Normal)', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    special: { label: '特殊权限 (Special/Settings)', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    signature: { label: '系统签名权限 (Signature)', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' }
  };

  return (
    <ToolPage
      title="Android 常用核心权限清单与速查"
      description="收录 Android 核心与危险权限、保护级别、新增版本及 AndroidManifest.xml 一键复制"
    >
      <div className="space-y-6">
        {/* 控制与搜索栏 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索权限常数、中文名称或说明（如 camera、存储、位置、SMS）..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">全部权限等级 ({PERMISSIONS.length})</option>
              <option value="dangerous">危险权限 (Dangerous)</option>
              <option value="normal">普通权限 (Normal)</option>
              <option value="special">特殊权限 (Special)</option>
            </select>
          </div>

          {/* 分组筛选标签 */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500 flex items-center gap-1 self-center mr-1">
              <Layers className="w-3.5 h-3.5" /> 分组:
            </span>
            {groups.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  selectedGroup === g
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 权限卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => {
            const xmlSnippet = `<uses-permission android:name="${item.permission}" />`;
            const badge = levelBadges[item.level];
            return (
              <div
                key={item.permission}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {item.name}
                      </h3>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${badge.color}`}>
                      {item.level.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700/60 text-xs">
                  <div className="flex items-center justify-between font-mono bg-gray-50 dark:bg-gray-900/60 p-1.5 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-blue-600 dark:text-blue-400 truncate pr-2" title={item.permission}>
                      {item.permission}
                    </span>
                    <CopyButton text={item.permission} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>引入: {item.addedIn}</span>
                    <div className="flex items-center gap-1">
                      <span>复制 XML:</span>
                      <CopyButton text={xmlSnippet} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            未找到匹配的 Android 权限，尝试更换搜索关键词
          </div>
        )}
      </div>
    </ToolPage>
  );
}
