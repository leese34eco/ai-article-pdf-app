# AI 기사문 PDF 생성기 (무로그인)

사진과 메모를 업로드하면 Azure OpenAI (비전) 모델이 분석하여 **기사문**을 생성합니다.
브라우저에서 결과를 **편집**하고, **PDF(텍스트만)** 또는 **PDF(사진 포함)** 으로 다운로드할 수 있습니다.

## 기능
- 무로그인 공개 사용 (Azure Static Web Apps)
- 이미지+텍스트 동시 분석 (GPT‑4o 계열 비전 모델)
- 결과 마크다운 편집 → 브라우저에서 PDF로 저장(jsPDF)
- 서버는 업로드 데이터를 **저장하지 않고** 즉시 처리 후 폐기

## 배포(요약)
1. 이 저장소를 GitHub에 푸시
2. Azure Portal → **Static Web Apps** 생성 (GitHub 연결)
   - App location: `/`
   - API location: `api`
   - Output location: *(비움)*
3. SWA **Configuration**에 환경 변수 추가
   - `OPENAI_ENDPOINT` : `https://<resource>.openai.azure.com/`
   - `OPENAI_API_KEY` : `<키>`
   - `OPENAI_DEPLOYMENT` : `gpt-4o` (또는 배포한 모델명)
   - `OPENAI_API_VERSION` : `2024-02-15-preview`
4. 배포가 완료되면 SWA의 공개 URL을 공유하면 끝!

## 로컬 테스트(선택)
- Functions Core Tools와 Node 18+ 필요. `api` 폴더에서 `npm i` 후 Functions 실행.

## 주의
- 모델 정책상 **요청당 이미지 최대 10장**을 권장합니다.
- 교육 환경을 고려하여 Azure AI Content Safety 연계를 권장합니다(코드 훅 포함).

