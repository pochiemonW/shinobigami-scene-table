"use client";
import { useState } from 'react';

export default function Home() {
  const [theme, setTheme] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [customMood, setCustomMood] = useState('');
  const [sceneTable, setSceneTable] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 雰囲気の選択肢
  const moodOptions = [
    '平和', '穏やか', '不穏', '神秘的', '活気的', 
    '静寂', '緊張', '温かみ', '冷たい', '幻想的', 'ホラー', 'ギャグ', 'トラブル'
  ];
  
  const handleGenerate = async () => {
    setLoading(true);
    setSceneTable('');
    setCopied(false);
    
    // すべての雰囲気を結合（選択されたボタン + カスタム入力）
    const allMoods = [...selectedMoods];
    if (customMood.trim()) {
      allMoods.push(customMood.trim());
    }
    const mood = allMoods.join('、');
    
    try {
      const res = await fetch('/api/generateSceneTable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, mood }),
      });
      const data = await res.json();
      setSceneTable(data.sceneTable || '生成に失敗しました');
    } catch (e) {
      setSceneTable('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!sceneTable) return;
    await navigator.clipboard.writeText(sceneTable);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleCustomMoodAdd = () => {
    if (customMood.trim() && !selectedMoods.includes(customMood.trim())) {
      setSelectedMoods(prev => [...prev, customMood.trim()]);
      setCustomMood('');
    }
  };

  const handleCustomMoodKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomMoodAdd();
    }
  };

  const removeMood = (moodToRemove: string) => {
    setSelectedMoods(prev => prev.filter(mood => mood !== moodToRemove));
  };

  const clearAllMoods = () => {
    setSelectedMoods([]);
  };

  // 雰囲気が選択されているかチェック
  const isMoodValid = selectedMoods.length > 0 || customMood.trim();

  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">シノビガミ用シーン表自動生成アプリ</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          {/* 左側: 入力フォーム */}
          <div className="flex flex-col gap-4 w-full lg:w-96 lg:flex-shrink-0">
            <label className="flex flex-col gap-1">
              <span>シーン表のテーマ（例：温泉旅館、廃病院など）</span>
              <input
                className="border rounded px-2 py-1"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="例：温泉旅館"
              />
            </label>
            <div className="flex flex-col gap-2">
              <span>雰囲気（複数選択可）</span>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((moodOption) => (
                  <button
                    key={moodOption}
                    type="button"
                    onClick={() => handleMoodToggle(moodOption)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedMoods.includes(moodOption)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {moodOption}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <div className="flex gap-2">
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    value={customMood}
                    onChange={e => setCustomMood(e.target.value)}
                    onKeyPress={handleCustomMoodKeyPress}
                    placeholder="自由に入力して追加"
                  />
                  <button
                    type="button"
                    onClick={handleCustomMoodAdd}
                    disabled={!customMood.trim() || selectedMoods.includes(customMood.trim())}
                    className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    追加
                  </button>
                </div>
              </div>
              {selectedMoods.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">選択された雰囲気:</span>
                    <button
                      type="button"
                      onClick={clearAllMoods}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      すべて解除
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMoods.map((mood) => (
                      <span
                        key={mood}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                      >
                        {mood}
                        <button
                          type="button"
                          onClick={() => removeMood(mood)}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              className="bg-blue-600 text-white rounded px-4 py-2 font-semibold disabled:opacity-50 hover:bg-blue-700"
              onClick={handleGenerate}
              disabled={loading || !theme || !isMoodValid}
            >
              {loading ? '生成中...' : 'シーン表を生成'}
            </button>
          </div>

          {/* 右側: 生成結果 */}
          {sceneTable && (
            <div className="flex-1 bg-white dark:bg-gray-800 rounded shadow p-4">
              <h2 className="font-bold mb-3">生成されたシーン表</h2>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto border rounded p-3 mb-3 bg-gray-50 dark:bg-gray-700">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{sceneTable}</pre>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-green-600 text-white rounded px-3 py-1 font-semibold hover:bg-green-700"
                  onClick={handleCopy}
                >
                  {copied ? 'コピーしました！' : 'クリップボードにコピー'}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                  {sceneTable.length}文字
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* クレジット表示 */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>本作は、「河嶋陶一朗／冒険企画局」及び「株式会社新紀元社」が権利を有する『忍術バトルRPGシノビガミ』の二次創作物です。</p>
            <p>（C）河嶋陶一朗／冒険企画局／新紀元社</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
