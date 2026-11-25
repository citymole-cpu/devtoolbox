import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Home, Calculator, Layers, Paintbrush, Box, Grid } from 'lucide-react';

type RenoMode = 'floorTile' | 'wallTile' | 'flooring' | 'wallpaper' | 'paint';

export default function RenovationCalc() {
  const [mode, setMode] = useState<RenoMode>('floorTile');

  // 地砖
  const [ftRoomLength, setFtRoomLength] = useState<number>(5); // 米
  const [ftRoomWidth, setFtRoomWidth] = useState<number>(4);
  const [ftTileSize, setFtTileSize] = useState<string>('800x800'); // 毫米
  const [ftLossRate, setFtLossRate] = useState<number>(5); // 损耗率%
  const [ftUnitPrice, setFtUnitPrice] = useState<number>(45); // 单价/块

  // 墙砖
  const [wtPerimeter, setWtPerimeter] = useState<number>(12); // 周长 米
  const [wtHeight, setWtHeight] = useState<number>(2.8); // 墙高 米
  const [wtDoorWindowArea, setWtDoorWindowArea] = useState<number>(3.5); // 扣除门窗平米
  const [wtTileSize, setWtTileSize] = useState<string>('300x600');
  const [wtLossRate, setWtLossRate] = useState<number>(5);

  // 地板
  const [flRoomLength, setFlRoomLength] = useState<number>(4.5);
  const [flRoomWidth, setFlRoomWidth] = useState<number>(3.6);
  const [flBoardSize, setFlBoardSize] = useState<string>('1215x195'); // 毫米
  const [flLossRate, setFlLossRate] = useState<number>(6);
  const [flPricePerSq, setFlPricePerSq] = useState<number>(160); // 元/平米

  // 壁纸
  const [wpPerimeter, setWpPerimeter] = useState<number>(14);
  const [wpHeight, setWpHeight] = useState<number>(2.7);
  const [wpDoorWindowArea, setWpDoorWindowArea] = useState<number>(4);
  const [wpRollWidth, setWpRollWidth] = useState<number>(0.53); // 米
  const [wpRollLength, setWpRollLength] = useState<number>(10); // 米

  // 涂料/乳胶漆
  const [ptRoomLength, setPtRoomLength] = useState<number>(4);
  const [ptRoomWidth, setPtRoomWidth] = useState<number>(3.5);
  const [ptHeight, setPtHeight] = useState<number>(2.8);
  const [ptDoorWindowArea, setPtDoorWindowArea] = useState<number>(3.5);
  const [ptCoats, setPtCoats] = useState<number>(2); // 遍数
  const [ptCoveragePerLiter, setPtCoveragePerLiter] = useState<number>(12); // 平米/升/遍
  const [ptBucketLiters, setPtBucketLiters] = useState<number>(5); // 桶规格 5L

  // 计算地砖
  const calculateFloorTile = () => {
    const area = ftRoomLength * ftRoomWidth;
    const [w, h] = ftTileSize.split('x').map(n => Number(n) / 1000);
    const tileArea = w * h;
    const exactPieces = area / tileArea;
    const totalPieces = Math.ceil(exactPieces * (1 + ftLossRate / 100));
    const totalCost = totalPieces * ftUnitPrice;
    return { area, totalPieces, totalCost };
  };

  // 计算墙砖
  const calculateWallTile = () => {
    const grossArea = wtPerimeter * wtHeight;
    const netArea = Math.max(0, grossArea - wtDoorWindowArea);
    const [w, h] = wtTileSize.split('x').map(n => Number(n) / 1000);
    const tileArea = w * h;
    const exactPieces = netArea / tileArea;
    const totalPieces = Math.ceil(exactPieces * (1 + wtLossRate / 100));
    return { netArea, totalPieces };
  };

  // 计算地板
  const calculateFlooring = () => {
    const area = flRoomLength * flRoomWidth;
    const [w, h] = flBoardSize.split('x').map(n => Number(n) / 1000);
    const boardArea = w * h;
    const totalAreaWithLoss = area * (1 + flLossRate / 100);
    const totalPieces = Math.ceil(totalAreaWithLoss / boardArea);
    const totalCost = Math.round(totalAreaWithLoss * flPricePerSq);
    return { area, totalAreaWithLoss, totalPieces, totalCost };
  };

  // 计算壁纸
  const calculateWallpaper = () => {
    const grossArea = wpPerimeter * wpHeight;
    const netArea = Math.max(0, grossArea - wpDoorWindowArea);
    // 每卷壁纸所能铺贴的条数
    const stripsPerRoll = Math.floor(wpRollLength / wpHeight);
    const totalStripsNeeded = Math.ceil(wpPerimeter / wpRollWidth);
    const totalRolls = stripsPerRoll > 0 ? Math.ceil(totalStripsNeeded / stripsPerRoll) : 0;
    return { netArea, totalRolls };
  };

  // 计算涂料
  const calculatePaint = () => {
    // 刷漆面积 = 墙面面积 (长+宽)*2*高 - 门窗面积 + 天花板面积 (长*宽)
    const wallArea = (ptRoomLength + ptRoomWidth) * 2 * ptHeight - ptDoorWindowArea;
    const ceilingArea = ptRoomLength * ptRoomWidth;
    const totalArea = Math.max(0, wallArea + ceilingArea);
    const totalSqNeeded = totalArea * ptCoats;
    const litersNeeded = Number((totalSqNeeded / ptCoveragePerLiter).toFixed(1));
    const bucketsNeeded = Math.ceil(litersNeeded / ptBucketLiters);
    return { totalArea, litersNeeded, bucketsNeeded };
  };

  return (
    <ToolPage
      title="装修建材用量计算器 (地砖/墙砖/地板/壁纸/涂料)"
      description="快速精准计算家庭装修中各类建材用量与耗材预算，包含合理施工损耗与门窗扣除"
    >
      <div className="space-y-6">
        {/* 分类标签切换 */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
          {[
            { id: 'floorTile', label: '地砖用量', icon: Grid },
            { id: 'wallTile', label: '墙砖用量', icon: Box },
            { id: 'flooring', label: '地板用量', icon: Layers },
            { id: 'wallpaper', label: '壁纸用量', icon: Home },
            { id: 'paint', label: '乳胶漆/涂料', icon: Paintbrush }
          ].map(tab => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as RenoMode)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 1. 地砖计算 */}
        {mode === 'floorTile' && (() => {
          const res = calculateFloorTile();
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-blue-500" /> 地砖参数输入
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">房间长度 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ftRoomLength}
                      onChange={e => setFtRoomLength(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">房间宽度 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ftRoomWidth}
                      onChange={e => setFtRoomWidth(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">地砖规格 (毫米)</label>
                    <select
                      value={ftTileSize}
                      onChange={e => setFtTileSize(e.target.value)}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    >
                      <option value="800x800">800 × 800 mm (客厅常用)</option>
                      <option value="600x600">600 × 600 mm (厨房卫生间)</option>
                      <option value="750x1500">750 × 1500 mm (大板微水泥)</option>
                      <option value="300x300">300 × 300 mm (防滑小地砖)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">施工损耗率 (%)</label>
                    <input
                      type="number"
                      value={ftLossRate}
                      onChange={e => setFtLossRate(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-gray-500 block mb-1">地砖参考单价 (元/块)</label>
                  <input
                    type="number"
                    value={ftUnitPrice}
                    onChange={e => setFtUnitPrice(Number(e.target.value))}
                    className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* 结果 */}
              <div className="bg-blue-50/50 dark:bg-gray-800/80 p-5 rounded-xl border border-blue-100 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-4">
                    地砖用量估算结果
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">铺贴净面积</div>
                      <div className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                        {res.area.toFixed(2)} <span className="text-xs font-normal">㎡</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">建议采购量 (含损耗)</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {res.totalPieces} <span className="text-xs font-normal">块</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 实际单块面积: {(Number(ftTileSize.split('x')[0]) * Number(ftTileSize.split('x')[1]) / 1000000).toFixed(3)} ㎡</p>
                    <p>• 预估地砖材料总花费: <span className="font-semibold text-rose-600">约 ¥{res.totalCost.toLocaleString()}</span> 元</p>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 bg-white/60 dark:bg-gray-900/40 p-2 rounded mt-4">
                  提示: 规则户型损耗一般在 3%-5%，若户型拐角多或菱形铺贴，建议上浮损耗至 8%-10%。
                </div>
              </div>
            </div>
          );
        })()}

        {/* 2. 墙砖计算 */}
        {mode === 'wallTile' && (() => {
          const res = calculateWallTile();
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-500" /> 墙面与瓷砖参数
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">墙面总周长 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wtPerimeter}
                      onChange={e => setWtPerimeter(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">贴砖高度 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wtHeight}
                      onChange={e => setWtHeight(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">门窗不贴砖面积 (㎡)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wtDoorWindowArea}
                      onChange={e => setWtDoorWindowArea(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">墙砖规格</label>
                    <select
                      value={wtTileSize}
                      onChange={e => setWtTileSize(e.target.value)}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    >
                      <option value="300x600">300 × 600 mm (厨卫常规)</option>
                      <option value="400x800">400 × 800 mm (现代中板)</option>
                      <option value="300x300">300 × 300 mm</option>
                      <option value="600x1200">600 × 1200 mm (大砖上墙)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-gray-800/80 p-5 rounded-xl border border-blue-100 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-4">
                    墙砖用量结果
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">贴砖净面积</div>
                      <div className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                        {res.netArea.toFixed(2)} ㎡
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">建议购买片数</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {res.totalPieces} 片
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 bg-white/60 dark:bg-gray-900/40 p-2 rounded">
                  小贴士: 厨卫墙面开孔（如水管孔、排烟道）较多，建议多预留 2-4 片备用。
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3. 地板计算 */}
        {mode === 'flooring' && (() => {
          const res = calculateFlooring();
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" /> 木地板参数
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">房间长度 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={flRoomLength}
                      onChange={e => setFlRoomLength(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">房间宽度 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={flRoomWidth}
                      onChange={e => setFlRoomWidth(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">地板单板规格 (毫米)</label>
                    <select
                      value={flBoardSize}
                      onChange={e => setFlBoardSize(e.target.value)}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    >
                      <option value="1215x195">1215 × 195 mm (强化复合)</option>
                      <option value="910x125">910 × 125 mm (实木地板)</option>
                      <option value="1200x160">1200 × 160 mm (多层实木)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">每平米单价 (元)</label>
                    <input
                      type="number"
                      value={flPricePerSq}
                      onChange={e => setFlPricePerSq(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-gray-800/80 p-5 rounded-xl border border-blue-100 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-4">
                    木地板用量及费用
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">采购总面积 (含损耗)</div>
                      <div className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                        {res.totalAreaWithLoss.toFixed(2)} ㎡
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">预估木板块数</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {res.totalPieces} 块
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    预估总花费: <span className="font-bold text-rose-600 text-sm">¥{res.totalCost.toLocaleString()}</span> 元
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. 壁纸计算 */}
        {mode === 'wallpaper' && (() => {
          const res = calculateWallpaper();
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-500" /> 壁纸参数
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">房间周长 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wpPerimeter}
                      onChange={e => setWpPerimeter(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">墙面高度 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wpHeight}
                      onChange={e => setWpHeight(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">单卷宽度 (米)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={wpRollWidth}
                      onChange={e => setWpRollWidth(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">单卷长度 (米)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={wpRollLength}
                      onChange={e => setWpRollLength(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-gray-800/80 p-5 rounded-xl border border-blue-100 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-4">
                    壁纸用量结果
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">铺贴墙面面积</div>
                      <div className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                        {res.netArea.toFixed(1)} ㎡
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">所需壁纸卷数</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {res.totalRolls} 卷
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 5. 涂料/乳胶漆计算 */}
        {mode === 'paint' && (() => {
          const res = calculatePaint();
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-blue-500" /> 涂料与房间参数
                </h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">长 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ptRoomLength}
                      onChange={e => setPtRoomLength(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">宽 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ptRoomWidth}
                      onChange={e => setPtRoomWidth(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">高 (米)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ptHeight}
                      onChange={e => setPtHeight(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">门窗扣除 (㎡)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ptDoorWindowArea}
                      onChange={e => setPtDoorWindowArea(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">涂刷遍数</label>
                    <select
                      value={ptCoats}
                      onChange={e => setPtCoats(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    >
                      <option value={1}>1 遍 (面漆补刷)</option>
                      <option value={2}>2 遍 (常规面漆标准)</option>
                      <option value={3}>3 遍</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">桶装规格 (L/桶)</label>
                    <select
                      value={ptBucketLiters}
                      onChange={e => setPtBucketLiters(Number(e.target.value))}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    >
                      <option value={5}>5 升/桶</option>
                      <option value={15}>15 升/桶 (工程/大桶)</option>
                      <option value={18}>18 升/桶</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-gray-800/80 p-5 rounded-xl border border-blue-100 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-4">
                    乳胶漆/涂料耗量
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">涂刷总面积 (墙面+顶面)</div>
                      <div className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                        {res.totalArea.toFixed(1)} ㎡
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500">所需漆量 (推荐购买)</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {res.litersNeeded} L ({res.bucketsNeeded} 桶)
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    计算基于理论涂布率 12㎡/升/遍，实际耗量受墙面基层吸水率及加水量微调。
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </ToolPage>
  );
}
