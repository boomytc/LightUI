import { useState } from "react";
import {
  Mic,
  UploadCloud,
  CheckCircle2,
  Clock,
  Fingerprint,
  Plus,
  Play,
  X,
  Volume2,
  ShieldCheck,
} from "lucide-react";
import type { SpeakerProfile } from "../lib/types";
import { getSpeakerTheme } from "../lib/machines";

interface VoiceprintDrawerProps {
  speakers: SpeakerProfile[];
  onAddSpeaker: (name: string, dept: string) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onStartMeeting: () => void;
}

export function VoiceprintDrawer({
  speakers,
  onAddSpeaker,
  isOpen,
  onOpen,
  onClose,
  onStartMeeting,
}: VoiceprintDrawerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingCountdown, setRecordingCountdown] = useState(3);
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("");
  const [recordSuccess, setRecordSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileMessage, setFileMessage] = useState<string | null>(null);

  const handleStartSimulatedRecord = () => {
    if (!newName.trim()) return;
    setIsRecording(true);
    setRecordingCountdown(3);
    setRecordSuccess(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setRecordingCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setIsRecording(false);
        setRecordSuccess(true);
        setTimeout(() => {
          onAddSpeaker(newName.trim(), newDept.trim() || "协同技术组");
          setNewName("");
          setNewDept("");
          setRecordSuccess(false);
        }, 800);
      }
    }, 1000);
  };

  const handleFileProcess = (file: File) => {
    const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[_\-\s].*$/, "");
    const candidateName = rawName || "新参会人";
    setNewName(candidateName);
    setFileMessage(`已解析音频: ${file.name} (192维特征抽取完成)`);
    setTimeout(() => {
      onAddSpeaker(candidateName, newDept.trim() || "微信语音录入");
      setNewName("");
      setNewDept("");
      setFileMessage(null);
    }, 900);
  };

  return (
    <div className="w-full">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-fg">会前参会人声纹底库 (Voiceprint Drawer)</h2>
          </div>
          <p className="text-sm text-fg-muted mt-1">
            注册参会人 192 维声纹特征向量，在会中为实时 ASR 提供准确无感的后验认人时空绑定。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="px-3.5 py-2 text-sm font-medium text-fg hover:text-accent bg-surface border border-border rounded-lg shadow-sm hover:bg-surface-2 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-accent" />
            新增声纹档案
          </button>
          <button
            type="button"
            onClick={onStartMeeting}
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            进入实时会议主舞台
          </button>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {speakers.map((spk) => {
          const theme = getSpeakerTheme(spk.id);
          return (
            <div
              key={spk.id}
              className={`p-4 rounded-xl border ${theme.bubbleBorder} ${theme.bubbleBg} relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-base shadow-sm`}
                      style={{ backgroundColor: theme.primary }}
                    >
                      {spk.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-fg text-base">{spk.name}</span>
                        <span className="text-xs text-fg-subtle">#{spk.id}</span>
                      </div>
                      <span className="text-xs text-fg-muted block truncate max-w-[120px]">
                        {spk.title}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    已建档
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5 text-xs text-fg-muted">
                  <div className="flex justify-between">
                    <span className="text-fg-subtle">归属部门:</span>
                    <span className="font-medium text-fg">{spk.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-subtle">样本数量:</span>
                    <span>{spk.samplesCount} 段语音样本</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-subtle">声学时长:</span>
                    <span>{spk.totalDuration_s} 秒 (16kHz Mono)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-subtle">特征维度:</span>
                    <span className="font-mono text-accent">{spk.vectorDim || 192}-dim</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-fg-subtle">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {spk.enrolledAt}
                </span>
                <span className="text-accent flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 阈值 0.68
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer / Modal: Add Voiceprint */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/60">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-fg">录入参会人声纹样本</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-fg-subtle hover:text-fg p-1 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1">参会人姓名 *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例如: 王小明"
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1">所属部门 / 职位</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="例如: 智能平台部 · 前端开发"
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Minimalist 3s Recording Interaction */}
              <div className="p-4 rounded-xl border border-dashed border-border bg-surface-2/40 flex flex-col items-center justify-center text-center">
                {isRecording ? (
                  <div className="py-4 space-y-2">
                    <div className="w-16 h-16 rounded-full bg-wrong/10 text-wrong flex items-center justify-center animate-pulse mx-auto">
                      <Mic className="w-8 h-8 animate-bounce" />
                    </div>
                    <p className="text-base font-bold text-wrong">请对着麦克风清晰朗读 3 秒...</p>
                    <p className="text-2xl font-mono font-bold text-fg">{recordingCountdown}s</p>
                  </div>
                ) : recordSuccess ? (
                  <div className="py-4 space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-intent mx-auto" />
                    <p className="text-sm font-semibold text-intent">
                      录音完成！192 维特征抽取入库成功
                    </p>
                  </div>
                ) : (
                  <div className="py-3 space-y-2">
                    <Volume2 className="w-8 h-8 text-accent mx-auto" />
                    <p className="text-sm font-medium text-fg">方式一：朗读 3 秒快速录音提取</p>
                    <p className="text-xs text-fg-muted">
                      点击下方录制，系统将采集 16kHz PCM 单声道音频并计算声纹特征嵌入向量
                    </p>
                    <button
                      type="button"
                      disabled={!newName.trim()}
                      onClick={handleStartSimulatedRecord}
                      className="mt-2 px-4 py-2 text-xs font-medium text-white bg-wrong hover:bg-wrong/90 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      开始 3 秒录制
                    </button>
                  </div>
                )}
              </div>

              {/* Drag and Drop Area */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFileProcess(e.dataTransfer.files[0]);
                  }
                }}
                className={`p-3.5 rounded-lg border border-dashed transition-all flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer ${
                  isDragging
                    ? "border-accent bg-accent-soft/40 text-accent"
                    : "border-border/80 bg-surface text-fg-muted hover:border-accent hover:text-fg"
                }`}
              >
                <input
                  type="file"
                  accept=".wav,.mp3,.m4a,.flac,.aac"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-accent" />
                  <span>方式二：拖拽或点击选择微信语音/录音文件 (WAV, MP3, M4A)</span>
                </div>
                {fileMessage && (
                  <p className="text-[11px] font-medium text-intent animate-pulse">
                    {fileMessage}
                  </p>
                )}
              </label>
            </div>

            <div className="px-6 py-3.5 border-t border-border bg-surface-2/40 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-fg-muted hover:text-fg bg-surface border border-border rounded-lg"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
