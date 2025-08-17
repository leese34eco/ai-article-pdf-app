// api/generate/index.js
const parseMultipart = require("@anzp/azure-function-multipart");
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const OPENAI_ENDPOINT    = process.env.OPENAI_ENDPOINT;     // https://<resource>.openai.azure.com/
const OPENAI_API_KEY     = process.env.OPENAI_API_KEY;      // 키
const OPENAI_DEPLOYMENT  = process.env.OPENAI_DEPLOYMENT;   // 예: gpt-4o
const OPENAI_API_VERSION = process.env.OPENAI_API_VERSION || "2024-02-15-preview";

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = { status: 405, body: { error: "Method Not Allowed" } };
    return;
  }

  const { fields, files } = await parseMultipart(req);
  const notes = (fields.find(f => f.fieldname === 'notes')?.value || '').toString();

  context.log(`Generate request: images=${files.filter(f=>f.fieldname==='images').length}, notesLen=${notes.length}`);

  // (옵션) Content Safety 검사 훅
  // TODO: Azure AI Content Safety 텍스트/이미지 검사 추가 가능

  const system = `
당신은 학생들의 현장체험/식당 방문 기록으로 기사문을 작성하는 기자입니다.
필수 섹션: # 개요, ## 활동, ## 배운점, ## 사진 캡션
- 평균 분량: 약 3문단(필요 시 약간 가감)
- 사진 내용과 메모를 교차검증, 과장 없이 사실 기반
- Markdown으로만 답변(헤딩/리스트/굵게 등 사용)
`.trim();

  const content = [];
  if (notes) content.push({ type: "text", text: `메모:\n${notes}` });

  const images = files.filter(f => f.fieldname === 'images').slice(0, 10);
  for (const f of images) {
    const base64 = Buffer.from(f.bufferFile.data).toString('base64');
    const mime = f.mimetype || 'image/jpeg';
    content.push({ type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } });
  }

  const url = `${OPENAI_ENDPOINT}openai/deployments/${OPENAI_DEPLOYMENT}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  const body = {
    messages: [ { role: "system", content: system }, { role: "user", content } ],
    max_tokens: 900,
    temperature: 0.7
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type":"application/json", "api-key": OPENAI_API_KEY },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const err = await r.text();
    context.res = { status: r.status, body: { error: "OpenAI 호출 실패", detail: err } };
    return;
  }

  const data = await r.json();
  const markdown = data?.choices?.[0]?.message?.content || "";

  context.res = { headers: { "Content-Type":"application/json" }, body: { markdown } };
};
