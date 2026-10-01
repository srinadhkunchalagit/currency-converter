import React, { useEffect, useState } from "react";

export default function Currency3DBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse between -1 and 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Parallax offsets
  const tiltX = mousePos.y * 6;
  const tiltY = -mousePos.x * 6;

  return (
    <div className="currency-3d-scene" aria-hidden="true">
      {/* 🇮🇳 1. Indian Rupee Note (₹500 Theme - Stone Grey & Saffron Gold) */}
      <div
        className="note-3d-wrapper note-inr"
        style={{
          transform: `perspective(1000px) rotateX(${12 + tiltX * 0.8}deg) rotateY(${-18 + tiltY * 0.8}deg) rotateZ(-10deg) translateZ(-40px)`,
        }}
      >
        <div className="banknote note-card-inr">
          <div className="note-guilloche" />
          <div className="note-header">
            <span className="note-issuer">भारतीय रिज़र्व बैंक • RESERVE BANK OF INDIA</span>
            <span className="note-val-top">₹500</span>
          </div>

          <div className="note-body">
            <div className="note-emblem-ashoka">
              <svg viewBox="0 0 100 100" className="ashoka-icon" fill="currentColor">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="3" fill="none" />
                <circle cx="50" cy="50" r="10" fill="currentColor" />
                {[...Array(24)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 38 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={50 + 38 * Math.sin((i * 15 * Math.PI) / 180)}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
              <div className="ashoka-label">सत्यमेव जयते</div>
            </div>

            <div className="note-center-art">
              <div className="note-seal">₹</div>
              <div className="note-denomination">पाँच सौ रुपये • 500 RUPEES</div>
              <div className="security-thread">
                <span>RBI</span>
                <span>भारत</span>
                <span>₹500</span>
                <span>RBI</span>
              </div>
            </div>

            <div className="note-portrait-frame">
              <div className="portrait-silhouette">
                <svg viewBox="0 0 80 100" fill="currentColor" opacity="0.85">
                  <circle cx="40" cy="30" r="18" />
                  <path d="M15,90 C15,65 30,55 40,55 C50,55 65,65 65,90 Z" />
                  <circle cx="48" cy="28" r="4" fill="#ede6d3" opacity="0.6" />
                </svg>
              </div>
              <span className="portrait-name">MAHATMA GANDHI</span>
            </div>
          </div>

          <div className="note-footer">
            <span className="serial-no">7AB 892415</span>
            <span className="note-val-large">₹500</span>
          </div>
          <div className="note-foil-shimmer" />
        </div>
      </div>

      {/* 🇺🇸 2. US Dollar Note ($100 Theme - Federal Reserve Green & Blue Ribbon) */}
      <div
        className="note-3d-wrapper note-usd"
        style={{
          transform: `perspective(1000px) rotateX(${-8 + tiltX * 0.7}deg) rotateY(${16 + tiltY * 0.7}deg) rotateZ(8deg) translateZ(-60px)`,
        }}
      >
        <div className="banknote note-card-usd">
          <div className="note-guilloche" />
          <div className="note-header">
            <span className="note-issuer">FEDERAL RESERVE NOTE • THE UNITED STATES OF AMERICA</span>
            <span className="note-val-top">$100</span>
          </div>

          <div className="note-body">
            <div className="fed-seal">
              <svg viewBox="0 0 60 60" fill="currentColor">
                <circle cx="30" cy="30" r="26" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="3,2" />
                <text x="30" y="34" fontSize="12" textAnchor="middle" fontWeight="bold" fontFamily="serif">USA</text>
              </svg>
              <span className="seal-text">TREASURY</span>
            </div>

            <div className="blue-3d-ribbon">
              <span>★ 100 ★ 100 ★ 100 ★</span>
            </div>

            <div className="note-center-art">
              <div className="liberty-bell-ink">
                <svg viewBox="0 0 50 60" fill="currentColor" opacity="0.8">
                  <path d="M15,50 L35,50 L32,25 C32,18 28,12 25,12 C22,12 18,18 18,25 Z" />
                  <circle cx="25" cy="54" r="3" />
                </svg>
              </div>
              <div className="note-denomination">ONE HUNDRED DOLLARS</div>
            </div>

            <div className="note-portrait-frame">
              <div className="portrait-silhouette franklin">
                <svg viewBox="0 0 80 100" fill="currentColor" opacity="0.85">
                  <circle cx="40" cy="32" r="19" />
                  <path d="M12,92 C12,68 28,58 40,58 C52,58 68,68 68,92 Z" />
                  <path d="M28,45 Q40,50 52,45" stroke="#ede6d3" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <span className="portrait-name">BENJAMIN FRANKLIN</span>
            </div>
          </div>

          <div className="note-footer">
            <span className="serial-no">ML 49102837 B</span>
            <span className="note-val-large">$100</span>
          </div>
          <div className="note-foil-shimmer" />
        </div>
      </div>

      {/* 🇬🇧 3. British Pound Note (£50 Theme - Royal Crimson, Gold & Hologram) */}
      <div
        className="note-3d-wrapper note-gbp"
        style={{
          transform: `perspective(1000px) rotateX(${15 + tiltX * 0.9}deg) rotateY(${10 + tiltY * 0.9}deg) rotateZ(-5deg) translateZ(-80px)`,
        }}
      >
        <div className="banknote note-card-gbp">
          <div className="note-guilloche" />
          <div className="note-header">
            <span className="note-issuer">BANK OF ENGLAND • PROMISE TO PAY THE BEARER ON DEMAND</span>
            <span className="note-val-top">£50</span>
          </div>

          <div className="note-body">
            <div className="polymer-window">
              <div className="hologram-seal">
                <span className="hologram-symbol">£</span>
                <span className="hologram-crown">♚</span>
              </div>
              <span className="window-label">FIFTY POUNDS</span>
            </div>

            <div className="note-center-art">
              <div className="royal-crest">
                <svg viewBox="0 0 60 60" fill="currentColor">
                  <circle cx="30" cy="30" r="24" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M20,38 L30,16 L40,38 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="30" cy="28" r="4" fill="currentColor" />
                </svg>
              </div>
              <div className="note-denomination">FIFTY POUNDS STERLING</div>
            </div>

            <div className="note-portrait-frame">
              <div className="portrait-silhouette turing">
                <svg viewBox="0 0 80 100" fill="currentColor" opacity="0.85">
                  <circle cx="40" cy="30" r="18" />
                  <path d="M14,90 C14,66 28,56 40,56 C52,56 66,66 66,90 Z" />
                </svg>
              </div>
              <span className="portrait-name">ALAN TURING</span>
            </div>
          </div>

          <div className="note-footer">
            <span className="serial-no">AC24 991823</span>
            <span className="note-val-large">£50</span>
          </div>
          <div className="note-foil-shimmer" />
        </div>
      </div>
    </div>
  );
}
