'use client';

import { useState, useCallback, memo } from 'react';
import { ApiResponse } from '../types';

interface CardInfoDisplayProps {
  data: ApiResponse;
}

// 样式常量
const FIELD_VALUE_CLASS = "font-mono text-gray-900 bg-blue-50 px-2 py-1 rounded";
const FIELD_LABEL_CLASS = "text-sm text-gray-600 mb-2";

// 复制按钮组件 - 提取到外部避免重新创建
interface CopyButtonProps {
  text: string;
  label: string;
  copySuccess: string | null;
  onCopy: (text: string, label: string) => void;
}

const CopyButton = memo(({ text, label, copySuccess, onCopy }: CopyButtonProps) => {
  const isSuccess = copySuccess === label;

  return (
    <button
      onClick={() => onCopy(text, label)}
      className="ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
      title="复制"
      style={{ width: '24px', height: '24px' }} // 固定尺寸避免布局偏移
    >
      {isSuccess ? (
        <span className="text-green-600 text-xs font-bold">✓</span>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
});

CopyButton.displayName = 'CopyButton';

function CardInfoDisplay({ data }: CardInfoDisplayProps) {
  const { result, error } = data;
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // 如果有错误信息
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fadeIn">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  // 如果没有结果
  if (!result) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
      {/* 卡片信息内容 */}
      <div className="p-6">
        {/* 卡密 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={FIELD_LABEL_CLASS}>卡密</span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                额度: {result.card_limit}
              </span>
              {result.status === '已删除' && (
                <span className="text-red-500 text-sm">
                  已删除
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className={`${FIELD_VALUE_CLASS} text-sm break-all`}>
              {result.id}
            </span>
            <CopyButton text={result.id} label="卡密" copySuccess={copySuccess} onCopy={handleCopy} />
          </div>
        </div>

        {/* 卡号 */}
        <div className="mb-4">
          <div className={FIELD_LABEL_CLASS}>卡号</div>
          <div className="flex items-center">
            <span className={FIELD_VALUE_CLASS}>
              {result.card_number ?? '暂无'}
            </span>
            <CopyButton text={result.card_number?.toString() || ''} label="卡号" copySuccess={copySuccess} onCopy={handleCopy} />
          </div>
        </div>

        {/* 有效期 */}
        <div className="mb-4">
          <div className={FIELD_LABEL_CLASS}>有效期</div>
          <div className="flex items-center">
            <span className={FIELD_VALUE_CLASS}>
              {result.card_exp_date ?? '暂无'}
            </span>
            <CopyButton text={result.card_exp_date || ''} label="有效期" copySuccess={copySuccess} onCopy={handleCopy} />
          </div>
        </div>

        {/* CVC */}
        <div className="mb-4">
          <div className={FIELD_LABEL_CLASS}>CVC</div>
          <div className="flex items-center">
            <span className={FIELD_VALUE_CLASS}>
              {result.card_cvc ?? '暂无'}
            </span>
            <CopyButton text={result.card_cvc || ''} label="CVC" copySuccess={copySuccess} onCopy={handleCopy} />
          </div>
        </div>

        {/* 到期时间 */}
        <div className="mb-4">
          <div className={FIELD_LABEL_CLASS}>到期时间</div>
          <div className="text-gray-900">
            {new Date(result.delete_date || result.create_time).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}
          </div>
        </div>

        {/* 使用指南 - 仅在卡片已激活时显示 */}
        {result.card_number && result.card_exp_date && result.card_cvc && (
          <div className="mt-6 pt-6 border-t-4 border-blue-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-bold text-blue-900 mb-2">💳 绑定 Google 支付填写教程</h3>
              <p className="text-sm text-gray-600">按照下面8个步骤，复制对应信息填入 Google 支付即可</p>
            </div>

            {/* 步骤式指引 */}
            <div className="space-y-4">
              {/* 步骤1 */}
              <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-2 text-base">复制"卡号"</div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <div className="text-xs text-gray-500 mb-1">👆 点击上方卡号旁边的复制按钮</div>
                      <div className="font-mono text-lg font-bold text-blue-900">{result.card_number}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      👉 粘贴到 Google 支付的 <span className="bg-yellow-200 px-2 py-1 rounded font-semibold">Card number</span> 框
                    </div>
                  </div>
                </div>
              </div>

              {/* 步骤2 */}
              <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-2 text-base">复制"有效期"</div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <div className="text-xs text-gray-500 mb-1">👆 点击上方有效期旁边的复制按钮</div>
                      <div className="font-mono text-lg font-bold text-blue-900">{result.card_exp_date}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      👉 粘贴到 Google 支付的 <span className="bg-yellow-200 px-2 py-1 rounded font-semibold">MM/YY</span> 框
                    </div>
                  </div>
                </div>
              </div>

              {/* 步骤3 */}
              <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-2 text-base">复制"CVC"</div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <div className="text-xs text-gray-500 mb-1">👆 点击上方CVC旁边的复制按钮</div>
                      <div className="font-mono text-lg font-bold text-blue-900">{result.card_cvc}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      👉 粘贴到 Google 支付的 <span className="bg-yellow-200 px-2 py-1 rounded font-semibold">Security code</span> 框
                    </div>
                  </div>
                </div>
              </div>

              {/* 步骤4 */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-2 text-base">选择国家/地区</div>
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <div className="text-sm text-red-900 font-bold mb-2">
                        ⚠️ 必须选择 <span className="bg-red-600 text-white px-2 py-1 rounded">美国 (US)</span>
                      </div>
                      <div className="bg-white p-2 rounded text-center">
                        <div className="text-base font-bold text-orange-900">🇺🇸 United States (US)</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      👉 在 <span className="bg-yellow-200 px-2 py-1 rounded font-semibold">Country/region</span> 下拉框选择美国
                    </div>
                  </div>
                </div>
              </div>

              {/* 步骤5 */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-2 text-base">填写"持卡人姓名"</div>
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <div className="text-sm text-red-900 font-bold mb-2">
                        ⚠️ 这一项<span className="bg-red-600 text-white px-2 py-1 rounded mx-1">不用复制</span>自己随便写一个英文名
                      </div>
                      <div className="text-xs text-gray-600 mb-1">示例（任选一个或自己编）：</div>
                      <div className="bg-white p-2 rounded space-y-1">
                        <div className="font-mono text-sm">✓ Zhang San</div>
                        <div className="font-mono text-sm">✓ Li Si</div>
                        <div className="font-mono text-sm">✓ Wang Wu</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      👉 填入 Google 支付的 <span className="bg-yellow-200 px-2 py-1 rounded font-semibold">Cardholder name</span> 框
                    </div>
                  </div>
                </div>
              </div>

              {/* 步骤6 */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    6
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-2 text-base">填写"邮编"</div>
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <div className="text-sm text-red-900 font-bold mb-2">
                        ⚠️ 固定填这个数字，<span className="bg-red-600 text-white px-2 py-1 rounded mx-1">不要改</span>
                      </div>
                      <div className="bg-white p-3 rounded text-center">
                        <div className="font-mono text-3xl font-bold text-orange-900 tracking-wider">82240</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      👉 填入 Google 支付的 <span className="bg-yellow-200 px-2 py-1 rounded font-semibold">Billing zip code</span> 框
                    </div>
                  </div>
                </div>
              </div>

              {/* 步骤7 */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    7
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-2 text-base">点击"保存卡"按钮</div>
                    <div className="bg-white p-4 rounded border border-blue-200 text-center">
                      <div className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block font-bold">
                        保存卡
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 步骤8 */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    8
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-2 text-base">点击"订阅"按钮</div>
                    <div className="bg-white p-4 rounded border border-blue-200 text-center">
                      <div className="bg-blue-600 text-white px-8 py-3 rounded-lg inline-block font-bold">
                        订阅
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      完成订阅后即可使用服务
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 完成提示 */}
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <div className="font-bold text-green-900 mb-1">完成！</div>
                  <div className="text-sm text-green-800">按照上面8个步骤填写，就能成功绑定 Google 支付并完成订阅了！</div>
                </div>
              </div>
            </div>

            {/* 失败提示 */}
            <div className="mt-4 bg-red-50 border-2 border-red-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-bold text-red-900 mb-1">如果绑定失败怎么办？</div>
                  <div className="text-sm text-red-800">
                    请返回购买页面联系客服，我们会帮您解决问题。
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 账单地址 */}
        <div className="mb-4">
          <div className={FIELD_LABEL_CLASS}>账单地址</div>
          <div className="flex items-center">
            <span className={FIELD_VALUE_CLASS}>
              {result.billing_address || '131 Lupine Drive, Torrington, WY 82240'}
            </span>
            <CopyButton
              text={result.billing_address || '131 Lupine Drive, Torrington, WY 82240'}
              label="地址"
              copySuccess={copySuccess}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CardInfoDisplay);
