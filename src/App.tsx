import "./styles.css";

export default function App() {
  return (
    <main className="studio-shell">
      <section className="studio-hero" aria-labelledby="studio-title">
        <div>
          <p className="curriculum-line">3~4학년 국어 / 음악 융합</p>
          <h1 id="studio-title">감성 톡톡 동시 스튜디오: 내 목소리 오디오북</h1>
          <p className="studio-lede">
            내가 쓴 동시를 낭송하고, 시의 분위기에 맞는 소리를 골라 오디오 엽서로 저장합니다.
          </p>
        </div>
        <button type="button" className="primary-action">
          낭송 녹음 시작
        </button>
      </section>
    </main>
  );
}
