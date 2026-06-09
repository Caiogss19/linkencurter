import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div className="brand-name">
          <strong>Spark Maxx</strong>
          <span>Link Shortener</span>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>Link não encontrado</h1>
        <p className="subtitle">Esse link encurtado não existe ou foi removido.</p>
        <Link className="btn-link" href="/">Voltar ao início</Link>
      </div>
    </div>
  );
}
