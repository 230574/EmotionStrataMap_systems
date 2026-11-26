export default function BrandPanel() {
  return (
    <aside className="brand-panel" aria-label="アプリ紹介">
      <div className="brand-symbol" aria-hidden="true">
        <span className="strata-line strata-line-1" />
        <span className="strata-line strata-line-2" />
        <span className="strata-line strata-line-3" />
        <span className="strata-line strata-line-4" />
      </div>

      <div className="brand-copy">
        <p class="brand-kicker">Emotion Strata</p>
        <h1>感情の地層マップ</h1>
        <p className="brand-tagline">場所・時間・感情を重ねて、まちの空気を見える化する</p>
        <p className="brand-description">
          あなたの感情を地図上に記録し、地域ごとの空気や変化を可視化します。
        </p>
      </div>
    </aside>
  )
}
