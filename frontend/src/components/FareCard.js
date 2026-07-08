import React from 'react';

function FareCard({ dijkstra, bfs }) {
  if (!dijkstra?.fare || !bfs?.fare) return null;

  return (
    <section className="fare-section">
      <div className="fare-grid">
        <FareItem label="Dijkstra Route" fare={dijkstra.fare} time={dijkstra.time} />
        <FareItem label="BFS Route" fare={bfs.fare} time={bfs.time} />
      </div>
    </section>
  );
}

function FareItem({ label, fare, time }) {
  const hasDiscount = fare.smartCardDiscount > 0 || fare.offPeakDiscount > 0;

  return (
    <div className="fare-card">
      <h4>{label}</h4>

      {hasDiscount ? (
        <>
          <div className="fare-amount">₹{fare.fare}</div>
          <div className="fare-original">₹{fare.baseFare} base</div>
          <div className="fare-details">
            {fare.estimatedDistanceKm} km &middot; {fare.slab} slab
            {fare.isHoliday && ' · Sunday rate'}
          </div>
          {fare.discountInfo && (
            <div className="fare-discount">{fare.discountInfo}</div>
          )}
        </>
      ) : (
        <>
          <div className="fare-amount">₹{fare.fare}</div>
          <div className="fare-details">
            {fare.estimatedDistanceKm} km &middot; {fare.slab} slab
            {fare.isHoliday && ' · Sunday rate'}
          </div>
        </>
      )}

      {time && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            ~{time.totalMinutes} min total
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Travel: {time.breakdown.travelTime}m + Stops: {time.breakdown.dwellTime}m +
            Interchange: {time.breakdown.interchangeTime}m + Wait: {time.breakdown.initialWait}m
          </div>
          <div style={{
            fontSize: '0.6875rem',
            marginTop: '0.25rem',
            color: time.isPeakHour ? 'var(--accent)' : 'var(--success)',
            fontWeight: 500
          }}>
            {time.isPeakHour ? 'Peak Hour' : 'Off-Peak'} — Trains {time.trainFrequency}
          </div>
        </div>
      )}
    </div>
  );
}

export default FareCard;
