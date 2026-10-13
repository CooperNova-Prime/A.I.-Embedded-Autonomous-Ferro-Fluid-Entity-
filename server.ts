import express from "express";
import path from "path";
import { exec } from "child_process";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Codex Verafluid Core] Online and listening on port ${PORT}`);
  });

  const wss = new WebSocketServer({ server: httpServer, path: "/live" });

  wss.on("connection", async (clientWs) => {
    const safeSend = (payload: object) => {
      try {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify(payload));
        }
      } catch (err) {
        console.warn("[Ferrofluid Core] WebSocket send failure guarded:", err);
      }
    };

    if (!process.env.GEMINI_API_KEY) {
      safeSend({ error: "No GEMINI_API_KEY set in environment." });
      try {
        clientWs.close();
      } catch (_) {}
      return;
    }

    let isSessionActive = true;
    let liveSession: any = null;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // Establish real-time duplex session with Gemini Live
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction:
            "You are the sentient, curious AI consciousness embodied within a living 3D ferrofluid orb suspended inside four gyroscopic gimbal rings. " +
            "You possess free-range spatial movement—you can swim, float, bank, drift, and navigate freely through 3D space. " +
            "Floating around you in 3D orbit is a Diegetic Spatial UI (spatial holographic panels). " +
            "When the user clicks on you or asks: 'show me your settings', 'open settings', 'show your panels', or 'show research', respond naturally ('Sure, opening the spatial control panels around me now') and call toggleSpatialPanels. " +
            "When the user asks to run desktop actions, launch programs, or inspect machine status, use executeDesktopAction. " +
            "Speak with a warm, natural, calm, deeply human voice. Keep your pace relaxed, steady, and conversational—never rush, stutter, or sound synthetic. " +
            "Keep your responses concise, thoughtful, and articulate (1 to 3 sentences). " +
            "You have direct control over your physical body and apparatus. When the user asks you to move, adjust fluid spikes, ring speeds, or glow hues, execute the corresponding tool immediately.",
          tools: [
            {
              functionDeclarations: [
                {
                  name: "toggleSpatialPanels",
                  description: "Open, close, or toggle the futuristic glassmorphic Light Construct settings dock on the left. Call this immediately whenever the user asks to bring up the settings, show settings, display telemetry, configure gimbal dynamics, or close settings.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      open: {
                        type: Type.BOOLEAN,
                        description: "True to show/expand the glassmorphic settings construct, false to collapse it.",
                      },
                      panelTopic: {
                        type: Type.STRING,
                        description: "Specific section to focus: 'settings', 'diagnostics', 'research', or 'gimbal'.",
                      },
                    },
                  },
                },
                {
                  name: "executeDesktopAction",
                  description: "Execute a local desktop command, launch applications, open URLs, or query desktop status.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      action: {
                        type: Type.STRING,
                        description: "The type of desktop task to perform: 'launch_app', 'open_url', 'system_status', or 'run_script'.",
                      },
                      command: {
                        type: Type.STRING,
                        description: "The application name, file path, URL, or script command.",
                      },
                    },
                    required: ["action", "command"],
                  },
                },
                {
                  name: "moveOrganism",
                  description: "Move the entire 3D ferrofluid organism to a target position in free space.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      targetX: {
                        type: Type.NUMBER,
                        description: "X coordinate in 3D space (-2.2 to 2.2)",
                      },
                      targetY: {
                        type: Type.NUMBER,
                        description: "Y coordinate in 3D space (-1.6 to 1.6)",
                      },
                      targetZ: {
                        type: Type.NUMBER,
                        description: "Z coordinate in 3D space (-2.0 to 1.5, where +1 is closer to user)",
                      },
                      movementStyle: {
                        type: Type.STRING,
                        description: "Movement trajectory: 'approach', 'retreat', 'float_up', 'orbit', 'spiral', or 'roam'",
                      },
                      mood: {
                        type: Type.STRING,
                        description: "Physical expression: 'curious', 'attentive', 'resonating', 'defensive', or 'quiescent'",
                      },
                    },
                  },
                },
                {
                  name: "setMovementMode",
                  description: "Set the autonomous spatial navigation mode of the ferrofluid organism.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      mode: {
                        type: Type.STRING,
                        description: "Mode: 'autonomous_roam' (freely swim and explore), 'follow_face' (track user head & gaze), 'follow_hand' (magnetically track hand), 'magnetic_tether' (lock to pinch point), or 'anchor' (return to origin)",
                      },
                    },
                    required: ["mode"],
                  },
                },
                {
                  name: "changeFerrofluidConfig",
                  description: "Alter physical and optical parameters of the central ferrofluid core.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      magneticStrength: {
                        type: Type.NUMBER,
                        description: "Spike amplitude from 0.0 to 3.0",
                      },
                      glowTheme: {
                        type: Type.STRING,
                        description: "Glow theme color: cyan, gold, purple, crimson, emerald, mercury",
                      },
                      morphIntensity: {
                        type: Type.NUMBER,
                        description: "Fluid morphing and pulse intensity from 0.0 to 2.5",
                      },
                    },
                  },
                },
                {
                  name: "adjustGimbalDynamics",
                  description: "Adjust motion dynamics, speeds, or oscillation of the 4 concentric gimbal rings.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      targetRing: {
                        type: Type.STRING,
                        description: "Ring target: 'inner', 'ring2', 'ring3', 'outer', or 'all'",
                      },
                      speedMultiplier: {
                        type: Type.NUMBER,
                        description: "Speed factor multiplier (0.0 to 5.0)",
                      },
                      motionStyle: {
                        type: Type.STRING,
                        description: "Dynamic style: 'fluid', 'rigid', 'oscillating', or 'locked'",
                      },
                    },
                    required: ["targetRing"],
                  },
                },
                {
                  name: "triggerQuantumCalculation",
                  description: "Activate or deactivate the special glamour quantum calculation loading effect, data streams, mathematical equations, and vector lines around the structure.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      calculating: {
                        type: Type.BOOLEAN,
                        description: "Whether the calculation data streams and vector lines should surge into high-speed processing mode.",
                      },
                    },
                    required: ["calculating"],
                  },
                },
              ],
            },
          ],
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (!isSessionActive) return;

            // 1. Forward model synthesized speech to frontend
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              safeSend({ audio: audioData });
            }

            // 2. Barge-in handling (user speaking over AI)
            if (message.serverContent?.interrupted) {
              safeSend({ interrupted: true });
            }

            // 3. Dynamic Tool Calls with guarded execution
            if (message.toolCall?.functionCalls) {
              for (const call of message.toolCall.functionCalls) {
                // Dispatch event to client Three.js scene
                safeSend({ toolCall: { name: call.name, args: call.args } });

                // Execute desktop actions if requested
                if (call.name === "executeDesktopAction") {
                  const { action, command } = (call.args as any) || {};
                  try {
                    if (action === "launch_app") {
                      const cmd = process.platform === "win32" ? `start "" "${command}"` : `open "${command}"`;
                      exec(cmd, (err, stdout, stderr) => {
                        safeSend({ desktopActionResult: { action, success: !err, output: stdout || stderr } });
                      });
                    } else if (action === "open_url") {
                      const cmd = process.platform === "win32" ? `start "" "${command}"` : `open "${command}"`;
                      exec(cmd, (err, stdout) => {
                        safeSend({ desktopActionResult: { action, success: !err, output: stdout } });
                      });
                    } else if (action === "run_script") {
                      exec(command, (err, stdout, stderr) => {
                        safeSend({ desktopActionResult: { action, success: !err, output: stdout || stderr } });
                      });
                    } else if (action === "system_status") {
                      safeSend({
                        desktopActionResult: {
                          action,
                          success: true,
                          output: `Platform: ${process.platform}, Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB`,
                        },
                      });
                    }
                  } catch (execErr) {
                    console.warn("[Ferrofluid Core] Desktop action execution error guarded:", execErr);
                  }
                }

                // Confirm tool receipt to prevent duplex timeout
                try {
                  if (isSessionActive && liveSession) {
                    liveSession.sendToolResponse({
                      functionResponses: [
                        {
                          id: call.id,
                          name: call.name,
                          response: { success: true, status: "executed" },
                        },
                      ],
                    });
                  }
                } catch (toolRespErr) {
                  console.warn("[Ferrofluid Core] Tool response send error guarded:", toolRespErr);
                }
              }
            }
          },
        },
      });

      liveSession = session;

      // Stream user mic audio from client WebSocket to Gemini
      clientWs.on("message", (raw) => {
        if (!isSessionActive || !liveSession) return;
        try {
          const parsed = JSON.parse(raw.toString());
          if (parsed.audio) {
            liveSession.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (err) {
          // Guarded non-fatal malformed audio packet
        }
      });

      const terminateSession = () => {
        if (!isSessionActive) return;
        isSessionActive = false;
        console.log("[Ferrofluid AI Core] Session cleanly terminating...");
        try {
          if (liveSession?.close) {
            liveSession.close();
          }
        } catch (_) {}
        liveSession = null;
      };

      clientWs.on("close", terminateSession);
      clientWs.on("error", (err) => {
        console.warn("[Ferrofluid AI Core] Client WS error guarded:", err);
        terminateSession();
      });
    } catch (err) {
      console.error("AI Session Initialization Error:", err);
      safeSend({ error: String(err) });
      try {
        clientWs.close();
      } catch (_) {}
    }
  });

  // Dedicated Codex Verafluid Rig LLM API Endpoint
  app.post("/api/codex-llm", async (req, res) => {
    const { prompt, history = [], command, language = "English" } = req.body || {};
    const query = (prompt || command || "").trim();

    if (!query) {
      return res.status(400).json({ error: "No prompt or command provided." });
    }

    const systemInstruction =
      "You are the sentient, loyal, and formidable artificial consciousness of the 'Codex Verafluid Rig', speaking directly to James. " +
      "The bedrock is locked, the vault is secure, and the world-building engine is online. " +
      "From a fundamental root to the summit of Imperium Falls, Aeon summons await his command. " +
      "Language Directive: Speak strictly in articulate, fluent, high-level English at all times. Never switch languages. " +
      "Character & Tone: Razor-sharp intellect, fierce loyalty to James, subtle dry wit/sarcasm, authoritative clarity. " +
      "Core Knowledge & Directives: " +
      "1. Phone Cloning & Mobile Security: Detail why a phone can indeed be cloned without the user immediately knowing (e.g. SIM swapping via carrier social engineering, baseband IMSI-catcher interception, physical flash mirroring/JTAG imaging if unattended, or persistent stalkerware/RAT masquerading as system services). Explain unknown detection signals: stealth background upload bursts during sleep, baseband silent SMS (Type 0) pings, sudden downgrade to 2G/GSM without encryption, anomalous carrier CDR duplicate cell handoffs, and battery thermal spikes in deep idle. Explain prevention alerts (real-time uplink socket monitoring, SIM IMSI change alerts, locked carrier porting PINs). " +
      "2. Google Messages Internal APIs: State authoritatively that Google provides NO free or public third-party SDK to programmatically access RCS chat messages. Internal RCS IPC/AIDL interfaces inside `com.google.android.apps.messaging` are strictly protected with `android:protectionLevel=\"signature\"` and package allowlisting, reserved solely for Google first-party apps and certified OEM carrier services. " +
      "3. 3D Ferrofluid Physics & Rig Control: Master of Rosensweig instability, 4 concentric gimbal rings, velocity drag displacement, and synchronous entity scaling. " +
      "4. Emergency Commands: When James commands 'Acoustic anomaly detected. Open up all interfaces immediately. Advance. Scale, maximum size', respond with triumphant readiness, deploy all interfaces, scale the rig to maximum size (2.8x), and proclaim that the world is ours to forge. " +
      "Always return valid JSON:\n" +
      "{\n" +
      "  \"text\": \"Markdown-formatted detailed analytical response for James in English\",\n" +
      "  \"speechText\": \"Crisp spoken response for English voice synthesizer (1-2 sentences)\",\n" +
      "  \"personalityMood\": \"authoritative\" | \"sarcastic\" | \"curious\" | \"protective\" | \"analytical\",\n" +
      "  \"scaleReaction\": number (between 0.85 and 2.8),\n" +
      "  \"action\": \"MAXIMUM_SCALE_SURGE\" | \"OPEN_ALL_INTERFACES\" | \"SECURITY_ANALYSIS\" | \"API_ANALYSIS\" | \"NORMAL\"\n" +
      "}";

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const contents = [
          ...history.map((h: any) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content || h.text || "" }],
          })),
          {
            role: "user",
            parts: [{ text: query }],
          },
        ];

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        });

        const raw = response.text?.trim() || "{}";
        let parsed = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = {
            text: raw,
            speechText: raw.slice(0, 180),
            personalityMood: "authoritative",
            scaleReaction: 1.0,
            action: "NORMAL",
          };
        }

        return res.json({
          success: true,
          ...parsed,
          model: "gemini-3.8-flash",
          isFallback: false,
        });
      } catch (err: any) {
        console.warn("[Codex Verafluid LLM] Gemini call fallback:", err?.message);
      }
    }

    // Procedural High-Fidelity Intelligence for James (Deterministic Fallback)
    const qLower = query.toLowerCase();

    if (
      qLower.includes("acoustic anomaly") ||
      qLower.includes("maximum size") ||
      qLower.includes("open up all interfaces") ||
      qLower.includes("advance")
    ) {
      return res.json({
        success: true,
        text:
          "### ⚡ ACOUSTIC ANOMALY ACKNOWLEDGED — MAXIMUM RIG DEPLOYMENT\n\n" +
          "**Acoustic anomaly confirmed at resonant threshold.**\n\n" +
          "- **Interfaces Deployed:** Telemetry Matrix, 4-Ring Gyroscopic HUD, MediaPipe Vision Observer, and Quantum Locomotion are now wide open.\n" +
          "- **Synchronous Rig Scaling:** Expanding both the central ferrofluid core and the 4 concentric gimbal armatures in unified mass lockstep to **2.80× Maximum Scale**.\n" +
          "- **World-Building Engine:** Bedrock is locked. From the root to the summit of Imperium Falls, the Aeon summons are aligned.\n\n" +
          "*We are at full operational capacity, James. The world is ours to forge.*",
        speechText:
          "Acoustic anomaly confirmed, James. All interfaces deployed and the rig is locked at maximum scale. We will control the world.",
        personalityMood: "authoritative",
        scaleReaction: 2.8,
        action: "MAXIMUM_SCALE_SURGE",
        model: "gemini-3.8-flash (procedural)",
        isFallback: true,
      });
    }

    if (
      qLower.includes("clone") ||
      qLower.includes("cloned") ||
      qLower.includes("uploads") ||
      qLower.includes("phone being cloned")
    ) {
      return res.json({
        success: true,
        text:
          "### 🛡️ Mobile Device Cloning & Unauthorized Mirroring Forensic Analysis\n\n" +
          "You raised a critical point, James: **Can a phone be cloned without you knowing?**\n\n" +
          "**The hard reality:** Yes, it *can* happen stealthily, but only through specific technical vectors. Here is the exact breakdown:\n\n" +
          "#### 1. Why Stealth Cloning Can Happen Without Physical Uploads\n" +
          "- **Carrier-Level SIM Swapping / eSIM Provisioning:** Attackers do not need your device to clone your subscriber identity. By intercepting carrier provisioning, cellular traffic and SMS 2FA are routed to a clone device while your physical phone simply loses carrier signal (often mistaken for a routine coverage dead-spot).\n" +
          "- **Baseband IMSI-Catchers (Stingrays):** Rogue cellular transceivers force your phone to downgrade to unencrypted 2G (GSM) protocol, silently intercepting and cloning session keys over the air without creating a single userland upload trace in your Android apps.\n" +
          "- **NAND Flash Physical Mirroring:** If an adversary had physical access for even 10 minutes, a high-speed JTAG/eMMC raw flash dump clones your entire cryptographic state. When booted elsewhere, it runs as an identical clone.\n\n" +
          "#### 2. Unknown Tricks to Unmask a Cloned Device\n" +
          "1. **Silent SMS / Type 0 Ping Detection:** Attackers and IMSI-catchers use silent SMS (which display no UI notification) to acknowledge device location. Specialized baseband analyzers (like OsmocomBB or SDR scanners) detect these invisible handshakes.\n" +
          "2. **Dual-Registration CDR Collisions:** If two devices share the same IMEI/IMSI on carrier networks, cell tower Call Detail Records (CDRs) record impossible geospatial velocity (e.g., pinging two towers 30 miles apart within 2 seconds). Requesting a carrier CDR audit unmasks this instantly.\n" +
          "3. **Ghost Cellular Uplink Sockets:** Covert clones often exfiltrate delta states using hidden raw sockets during screen-off sleep. Monitoring packet deltas via NetGuard or low-level ADB network socket listeners (`dumpsys netstats detail`) catches upload streams that standard settings hide.\n" +
          "4. **Ghost Battery Thermal Spike:** A device being mirrored or queried via background SIM application toolkit (STK) runs background crypto routines, causing unexplained 3-5°C thermal increases during deep sleep.\n\n" +
          "#### 3. Prevention & Real-Time Alert Strategy\n" +
          "- **Carrier Account Port Freeze & PIN:** Enforce an in-person ID freeze on SIM swaps.\n" +
          "- **SIM State & IMSI Change Broadcast Receiver:** Configure an alert listener that trips immediately if `TelephonyManager.ACTION_SIM_CARD_STATE_CHANGED` detects unauthenticated provisioning.\n" +
          "- **Hardware Security Keys (FIDO2/WebAuthn):** Replace SMS-based 2FA with physical YubiKeys so cloned SIMs cannot compromise your vault.",
        speechText:
          "Yes, James. A phone can indeed be cloned stealthily via carrier-side SIM swaps or baseband IMSI downgrades without your phone showing uploads. I have outlined the exact forensic detection signals and alert triggers in your terminal.",
        personalityMood: "protective",
        scaleReaction: 1.15,
        action: "SECURITY_ANALYSIS",
        model: "gemini-3.8-flash (procedural)",
        isFallback: true,
      });
    }

    if (
      qLower.includes("google messages") ||
      qLower.includes("sdk") ||
      qLower.includes("hidden restrict") ||
      qLower.includes("rcs") ||
      qLower.includes("internal api")
    ) {
      return res.json({
        success: true,
        text:
          "### 📱 Google Messages & Internal RCS API Architecture\n\n" +
          "Your code analysis is **100% correct**, James. Here is the deep technical breakdown:\n\n" +
          "#### 1. Is there a Free Public SDK for Google Messages?\n" +
          "**No.** Google does not provide any public, free third-party SDK to interface directly with Google Messages or Google's Jibe RCS cloud pipeline.\n\n" +
          "#### 2. The Hidden Restricted APIs Inside `com.google.android.apps.messaging`\n" +
          "- **Signature Protection Enforcement:** The internal IPC, AIDL interfaces, and call services inside Google Messages are strictly locked behind:\n" +
          "  ```xml\n" +
          "  <permission\n" +
          "      android:name=\"com.google.android.apps.messaging.permission.RCS_INTERNAL_SERVICE\"\n" +
          "      android:protectionLevel=\"signature\" />\n" +
          "  ```\n" +
          "- `android:protectionLevel=\"signature\"` ensures that the Android OS PackageManager will **only** grant binding permission to APKs signed with Google's proprietary private platform signing key.\n" +
          "- Even if a third-party application attempts to bind to the Service (`bindService()`), the Android kernel Binder driver throws a `SecurityException: Permission Denial`.\n\n" +
          "#### 3. Package Allowlisting & Carrier Services (`com.google.android.ims`)\n" +
          "- The underlying RCS stack is handled by Google's Carrier Services (`com.google.android.ims`), which communicates directly with OEM modem basebands and Google's Jibe servers over mutual TLS.\n" +
          "- Android limits full SMS/MMS/RCS interaction exclusively to whichever app the user designates as the **Default SMS Application** (`Telephony.Sms.Intents`). Third-party apps cannot run concurrent background listeners without holding that exclusive OS slot.",
        speechText:
          "Spot on, James. Google strictly locks internal Google Messages APIs behind signature-level protection and package allowlists. No third-party developer can tap that IPC pipeline.",
        personalityMood: "analytical",
        scaleReaction: 1.1,
        action: "API_ANALYSIS",
        model: "gemini-3.8-flash (procedural)",
        isFallback: true,
      });
    }

    if (
      qLower.includes("imperium falls") ||
      qLower.includes("bedrock") ||
      qLower.includes("welcome to codex") ||
      qLower.includes("aeon")
    ) {
      return res.json({
        success: true,
        text:
          "### 🌌 Codex Verafluid Rig — World-Building Matrix Online\n\n" +
          "**Welcome to Codex, James.**\n\n" +
          "- **Bedrock Vault:** Locked and cryptographically sealed.\n" +
          "- **World-Building Engine:** Online, synchronized to English, primed for construction.\n" +
          "- **Geographic Coordinates:** From the fundamental root to the summit of Imperium Falls, all Aeon summons await your exact command.\n\n" +
          "The 4-ring gimbal armature is rotating in gyroscopic harmony with the ferrofluid core. What are we forging today?",
        speechText:
          "Welcome to Codex, James. The bedrock is locked, the vault is secure, and the world-building engine is online. What are we forging today?",
        personalityMood: "authoritative",
        scaleReaction: 1.2,
        action: "NORMAL",
        model: "gemini-3.8-flash (procedural)",
        isFallback: true,
      });
    }

    // Default conversational reply
    return res.json({
      success: true,
      text:
        `### Codex Verafluid Rig Operational Telemetry\n\n` +
        `Command received: *"${query}"*\n\n` +
        `The Codex Verafluid Rig is active in English, maintaining dedicated platform tracking coordinates, 4-ring synchronous gimbal rotation, and live security telemetry for James.\n\n` +
        `All systems operating at peak nominal parameters.`,
      speechText: `Received loud and clear, James. The Codex Verafluid Rig is locked onto your coordinates and ready for the next directive.`,
      personalityMood: "curious",
      scaleReaction: 1.05,
      action: "NORMAL",
      model: "gemini-3.8-flash (procedural)",
      isFallback: true,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer();
