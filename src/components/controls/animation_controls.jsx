// import { AnimationStates } from "../animations/animation_states";

// export default function AnimationControls({ onPlay }) {
//   return (
//     <div
//       style={{
//         position: "absolute",
//         bottom: 20,
//         left: "50%",
//         transform: "translateX(-50%)",
//         display: "flex",
//         gap: "12px",
//       }}
//     >
//       {Object.values(AnimationStates)
//         .filter((a) => !a.isDefault)
//         .map((anim) => (
//           <button
//             key={anim.name}
//             onClick={() => onPlay(anim.name)}
//           >
//             {anim.label}
//           </button>
//         ))}
//     </div>
//   );
// }

import { AnimationStates } from "../animations/animation_states";

export default function AnimationControls({ onPlay, isMobile }) {
  return (
    <>
      {Object.values(AnimationStates)
        .filter((a) => !a.isDefault)
        .map((anim) => (
          <button
            key={anim.name}
            onClick={() => onPlay(anim.name)}
            style={{
              padding: isMobile ? "10px 14px" : "12px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(0, 255, 255, 0.3)",
              background: "rgba(10, 10, 31, 0.9)",
              backdropFilter: "blur(10px)",
              color: "#0ff",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: isMobile ? "0.85rem" : "0.9rem",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
              whiteSpace: "nowrap",
              minWidth: isMobile ? "60px" : "80px",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0, 255, 255, 0.2)";
              e.target.style.transform = "translateX(5px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 255, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(10, 10, 31, 0.9)";
              e.target.style.transform = "translateX(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.4)";
            }}
          >
            {anim.label}
          </button>
        ))}
    </>
  );
}