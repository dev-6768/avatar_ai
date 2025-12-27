import { useLayoutEffect, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { AnimationStates } from "./animations/animation_states";
import AnimationControls from "./controls/animation_controls";

export default function AvatarScene() {
  const mountRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const activeActionRef = useRef(null);
  const clock = new THREE.Clock();
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const playbackQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const audioRef = useRef(null);

  const [messages, setMessages] = useState([
    { type: "user", text: "Hi! How are you?" },
    { type: "assistant", text: "Hello! I am your AI avatar." },
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useLayoutEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Background with fallback color
    const textureLoader = new THREE.TextureLoader();
    scene.background = new THREE.Color(0x0a0a1f);
    textureLoader.load(
      "/background/primary_background.png",
      (texture) => {
        scene.background = texture;
      },
      undefined,
      () => {
        scene.background = new THREE.Color(0x0a0a1f);
      }
    );

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Load Remy model
    const loader = new FBXLoader();
    loader.load(
      "/Remy.fbx",
      (model) => {
        model.scale.setScalar(0.008);
        scene.add(model);

        mixerRef.current = new THREE.AnimationMixer(model);

        mixerRef.current.addEventListener("finished", () => {
          playAnimation("idle");
        });

        Object.values(AnimationStates).forEach((state) => {
          loadAnimation(loader, state);
        });
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      mixerRef.current?.update(clock.getDelta());
      renderer.render(scene, camera);
    };
    animate();

    // Responsive resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const loadAnimation = (loader, state) => {
    loader.load(
      state.file,
      (anim) => {
        const action = mixerRef.current.clipAction(anim.animations[0]);
        action.setLoop(state.loop);
        action.clampWhenFinished = true;
        actionsRef.current[state.name] = action;
        if (state.isDefault) {
          action.play();
          activeActionRef.current = action;
        }
      },
      undefined,
      (error) => {
        console.error(`Error loading animation ${state.name}:`, error);
      }
    );
  };

  const playAnimation = (name) => {
    const next = actionsRef.current[name];
    const current = activeActionRef.current;
    if (!next || next === current) return;
    next.reset().fadeIn(0.3).play();
    current?.fadeOut(0.3);
    activeActionRef.current = next;
  };

  const scheduleNext = () => {
    if (isPlayingRef.current) return;
    const next = playbackQueueRef.current.shift();
    if (!next) return;

    isPlayingRef.current = true;

    const {
      sentence,
      sentiment,
      audio_file,
      animation,
      start_timestamp,
      end_timestamp,
    } = next;


    const now = performance.now();

    const startDelay = Math.max(0, start_timestamp - now);
    const duration = end_timestamp - start_timestamp;

    setTimeout(() => {
      // 🔹 Play animation
      playAnimation(animation || "idle");

      // 🔹 Play audio
      if (audio_file) {
        audioRef.current = new Audio("http://127.0.0.1:8000/" + audio_file);
        audioRef.current.play().catch(console.error);
      }

      // 🔹 Stop after duration
      setTimeout(() => {
        audioRef.current?.pause();
        audioRef.current = null;
        playAnimation("idle");
        isPlayingRef.current = false;
        scheduleNext(); // play next item
      }, duration);
    }, startDelay);
  };


  // const handleSend = () => {
  //   const text = inputRef.current?.value.trim();
  //   if (!text) return;
  //   setMessages((prev) => [...prev, { type: "user", text }]);
  //   if (inputRef.current) inputRef.current.value = "";
    
  //   // Simulate AI response
  //   setTimeout(() => {
  //     setMessages((prev) => [
  //       ...prev,
  //       { type: "ai", text: "Thanks for your message! I'm processing it." },
  //     ]);
  //   }, 500);
  // };

  const handleSend = async () => {
    const text = inputRef.current?.value.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { type: "user", text: text }]);
    playAnimation("think") //start thinking while fetching response.
    inputRef.current.value = "";

    // Example server call
    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: text,
        history: messages,
        personality: "You are a helpful, expressive and intelligent AI avatar assistant. Limit your responses to 100 words.",
      }),
    });
    const data = await res.json();
    playAnimation("idle") //as response is fetched now stop thinking and schedule idle scenario
    console.log(data)

    setMessages((prev) => [...prev, { type: "assistant", text: data.answer}]);

    // data.responses = [{ sentence, sentiment, audio_file, animation, start_timestamp, end_timestamp }]
    playbackQueueRef.current.push(...data.response);

    scheduleNext();
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        /* Component-specific resets */
        #avatar-chat-root * {
          box-sizing: border-box;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom scrollbar */
        #avatar-chat-root .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        #avatar-chat-root .messages-container::-webkit-scrollbar-track {
          background: #1a0a3b;
        }

        #avatar-chat-root .messages-container::-webkit-scrollbar-thumb {
          background: #0ff;
          border-radius: 3px;
        }

        #avatar-chat-root .messages-container::-webkit-scrollbar-thumb:hover {
          background: #00d4ff;
        }
      `}</style>

      <div
        id="avatar-chat-root"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          overflow: "hidden",
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          background: "linear-gradient(135deg, #0a0a1f 0%, #1a0a3b 100%)",
        }}
      >
        {/* Left: Three.js Canvas */}
        <div
          style={{
            flex: isMobile ? "1 1 50%" : "7 1 0",
            width: isMobile ? "100%" : "70%",
            height: isMobile ? "50%" : "100%",
            position: "relative",
            margin: 0,
            padding: 0,
            borderRight: isMobile ? "none" : "2px solid rgba(0, 255, 255, 0.3)",
            borderBottom: isMobile ? "2px solid rgba(0, 255, 255, 0.3)" : "none",
            boxShadow: isMobile
              ? "0 4px 20px rgba(0, 255, 255, 0.2)"
              : "4px 0 20px rgba(0, 255, 255, 0.2)",
            overflow: "hidden",
          }}
        >
          <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
          
          {/* Animation Controls - Positioned on left side */}
          <div
            style={{
              position: "absolute",
              left: isMobile ? "10px" : "20px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              zIndex: 10,
            }}
          >
            <AnimationControls onPlay={playAnimation} isMobile={isMobile} />
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div
          style={{
            flex: isMobile ? "1 1 50%" : "3 1 0",
            width: isMobile ? "100%" : "30%",
            height: isMobile ? "50%" : "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(180deg, #0a0a1f 0%, #1a0a3b 100%)",
            color: "#fff",
            padding: isMobile ? "16px" : "24px",
            margin: 0,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "0 0 16px 0",
              borderBottom: "2px solid rgba(0, 255, 255, 0.3)",
              marginBottom: "16px",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                background: "linear-gradient(90deg, #0ff 0%, #00d4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: isMobile ? "1.5rem" : "1.8rem",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              AI Chat
            </h2>
          </div>

          {/* Messages */}
          <div
            className="messages-container"
            style={{
              flex: "1 1 auto",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "0",
              margin: "0 0 16px 0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              scrollbarWidth: "thin",
              scrollbarColor: "#0ff #1a0a3b",
              minHeight: 0,
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  animation: "slideIn 0.3s ease-out",
                }}
              >
                <div
                  style={{
                    background:
                      msg.type === "user"
                        ? "linear-gradient(135deg, #0ff 0%, #00d4ff 100%)"
                        : "rgba(26, 10, 59, 0.8)",
                    color: msg.type === "user" ? "#000" : "#fff",
                    padding: "12px 16px",
                    borderRadius:
                      msg.type === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    boxShadow:
                      msg.type === "user"
                        ? "0 4px 12px rgba(0, 255, 255, 0.3)"
                        : "0 4px 12px rgba(0, 0, 0, 0.3)",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    border:
                      msg.type === "assistant" ? "1px solid rgba(0, 255, 255, 0.2)" : "none",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexShrink: 0,
              margin: 0,
              padding: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              onKeyPress={handleKeyPress}
              style={{
                flex: "1 1 auto",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(0, 255, 255, 0.3)",
                background: "rgba(26, 26, 47, 0.8)",
                color: "#fff",
                outline: "none",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                margin: 0,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#0ff";
                e.target.style.boxShadow = "0 0 12px rgba(0, 255, 255, 0.4)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 255, 255, 0.3)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #0ff 0%, #00d4ff 100%)",
                color: "#000",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0, 255, 255, 0.3)",
                flexShrink: 0,
                margin: 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(0, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 255, 255, 0.3)";
              }}
            >
              Send
            </button>
          </div>


        </div>
      </div>
    </>
  );
}