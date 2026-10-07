import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { askAssistant } from "../services/api";
import { AssistantResponse, Scheme } from "../types";
import { SchemeCard } from "../components/SchemeCard";

interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  schemes?: Scheme[];
}

export const Assistant: React.FC = () => {
  const { language, t } = useApp();

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text:
        language === "te"
          ? "నమస్కారం! నేను గ్రామసేవ బహుభాషా సహాయకుడిని. రైతు పథకాలు, ఇళ్ల నిర్మాణం, పింఛన్లు, స్కాలర్‌షిప్‌లు లేదా ఇతర ప్రభుత్వ సేవల గురించి తెలుగులో అడగండి."
          : language === "hi"
          ? "नमस्ते! मैं ग्रामसेवा बहुभाषी सहायक हूँ। किसान योजनाओं, आवास सहायता, पेंशन, छात्रवृत्ति या अन्य सरकारी सेवाओं के बारे में हिंदी में पूछें।"
          : "Hello! I am the GramaSeva multilingual assistant. Ask me about government schemes, documents, subsidies, or application steps in your language.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [voiceNotice, setVoiceNotice] = useState("");

  // Web Speech Recognition setup
  const recognition = useMemo(() => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      return rec;
    } catch {
      return null;
    }
  }, []);

  const handleStartVoice = () => {
    if (!recognition) {
      setVoiceNotice("Speech recognition is not supported in this browser. Please type your question.");
      return;
    }

    try {
      setVoiceNotice("");
      setIsListening(true);
      recognition.lang = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceNotice("Could not capture voice audio. Please try speaking again or type your question.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceNotice("Could not start microphone.");
    }
  };

  const handleStopVoice = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Text-to-speech reading
  const handleSpeak = (text: string, index: number) => {
    if (!("speechSynthesis" in window)) {
      setVoiceNotice("Audio speech synthesis is not supported on this device.");
      return;
    }

    if (speakingIdx === index) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";

    utterance.onend = () => {
      setSpeakingIdx(null);
    };
    utterance.onerror = () => {
      setSpeakingIdx(null);
    };

    setSpeakingIdx(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const response: AssistantResponse = await askAssistant(text, language);
      const assistantMsg: ChatMessage = {
        sender: "assistant",
        text: response.answer,
        schemes: response.schemes,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "I experienced a temporary connection difficulty. Please try your question again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleChips = [
    t.sq1,
    t.sq2,
    t.sq3,
    t.sq4,
    t.sq5,
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold">
          <Bot size={14} />
          <span>Multilingual Natural Search Assistant</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-gov-charcoal">
          {t.assistantTitle}
        </h1>
        <p className="text-gov-slate text-sm sm:text-base max-w-xl mx-auto">
          {t.assistantSubtitle}
        </p>
      </div>

      {/* Suggested Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
          {t.sampleQueries}
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-xs font-medium bg-white hover:bg-gov-sand/60 text-gov-charcoal border border-gov-sand px-3.5 py-2 rounded-xl transition-all shadow-sm hover:scale-[1.02]"
            >
              💬 {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-gov-sand shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[600px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 sm:gap-4 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "assistant" && (
                <div className="w-9 h-9 rounded-xl bg-gov-lightGreen text-gov-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={20} />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gov-primary text-white font-medium rounded-br-xs shadow-sm"
                    : "bg-gov-cream/80 text-gov-charcoal border border-gov-sand rounded-bl-xs shadow-sm space-y-4"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Text to Speech button for assistant messages */}
                {msg.sender === "assistant" && (
                  <div className="pt-2 flex items-center justify-between border-t border-gov-sand/60">
                    <button
                      onClick={() => handleSpeak(msg.text, i)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gov-primary hover:text-gov-darkGreen"
                    >
                      {speakingIdx === i ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      <span>{speakingIdx === i ? "Stop Audio" : t.readAloud}</span>
                    </button>
                  </div>
                )}

                {/* Related Scheme cards inside chat */}
                {msg.schemes && msg.schemes.length > 0 && (
                  <div className="pt-4 border-t border-gov-sand/80 space-y-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      Recommended Schemes:
                    </span>
                    <div className="grid grid-cols-1 gap-3">
                      {msg.schemes.map((s) => (
                        <SchemeCard key={s.id} scheme={s} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-9 h-9 rounded-xl bg-gov-darkGreen text-white flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-gov-slate text-sm">
              <div className="w-9 h-9 rounded-xl bg-gov-lightGreen text-gov-primary flex items-center justify-center">
                <Loader2 size={18} className="animate-spin" />
              </div>
              <span>Searching scheme guidelines...</span>
            </div>
          )}
        </div>

        {/* Voice Notice if any */}
        {voiceNotice && (
          <div className="px-6 py-2 bg-amber-50 text-amber-800 text-xs flex items-center justify-between border-t border-amber-200">
            <span>{voiceNotice}</span>
            <button onClick={() => setVoiceNotice("")} className="font-bold underline ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-t border-gov-sand bg-gov-cream/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            {/* Voice Toggle Button */}
            <button
              type="button"
              onClick={isListening ? handleStopVoice : handleStartVoice}
              title={isListening ? t.stopVoice : t.startVoice}
              className={`p-3.5 rounded-xl border flex-shrink-0 transition-colors ${
                isListening
                  ? "bg-red-500 text-white animate-pulse border-red-600"
                  : "bg-white text-gov-primary border-gov-sand hover:bg-gov-sand/60"
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? t.listening : t.assistantPlaceholder}
              className="flex-1 bg-white border border-gov-sand rounded-xl px-4 py-3.5 text-sm sm:text-base focus:ring-2 focus:ring-gov-primary focus:outline-none text-gov-charcoal"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-gov-primary hover:bg-gov-darkGreen disabled:opacity-50 text-white font-semibold p-3.5 sm:px-6 sm:py-3.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 shadow-sm"
            >
              <span className="hidden sm:inline">{t.askButton}</span>
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
