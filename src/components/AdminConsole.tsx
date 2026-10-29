import React, { useState } from 'react';
import { BeatItem, BeatStatus } from '../types';
import {
  generateRandomSlug,
  formatCurrentKstTimestamp,
  resetStoredBeats,
} from '../data/mockBeats';
import { extractWaveformPeaks } from '../utils/audioUtils';
import { AudioPreviewPlayer } from './AudioPreviewPlayer';
import { RetroWindowFrame } from './RetroWindowFrame';
import { useLanguage } from '../context/LanguageContext';
import {
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  ArrowLeft,
  Music,
  Upload,
  X,
  Sparkles,
} from 'lucide-react';

interface AdminConsoleProps {
  beats: BeatItem[];
  onUpdateBeats: (updated: BeatItem[]) => void;
  onPreviewBeat: (beatId: string) => void;
  onExitAdmin: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  beats,
  onUpdateBeats,
  onPreviewBeat,
  onExitAdmin,
}) => {
  const { language } = useLanguage();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ash_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BeatStatus>('all');

  // Edit / Add modal state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<BeatItem | null>(null);

  // Form fields (Internal beatId and slug maintained in state for data consistency, but never shown to user)
  const [formTitle, setFormTitle] = useState('');
  const [formBeatId, setFormBeatId] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formStatus, setFormStatus] = useState<BeatStatus>('available');
  const [formPublicNote, setFormPublicNote] = useState('');
  const [formBpm, setFormBpm] = useState<number | ''>(130);
  const [formKey, setFormKey] = useState('');
  const [formGenre, setFormGenre] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formAudioUrl, setFormAudioUrl] = useState('');
  const [formAudioFilename, setFormAudioFilename] = useState('');
  const [formPreviewStart, setFormPreviewStart] = useState<number>(0);
  const [formFadeEnabled, setFormFadeEnabled] = useState<boolean>(true);
  const [formFadeDuration, setFormFadeDuration] = useState<number>(2);
  const [formWaveformPeaks, setFormWaveformPeaks] = useState<number[] | undefined>(undefined);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'ash2026' || passcode === 'ashsolomo' || passcode === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ash_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ash_admin_auth');
  };

  // Process and extract audio file with real waveform peaks
  const processAudioFile = async (file: File) => {
    setFormAudioFilename(file.name);
    const peaks = await extractWaveformPeaks(file);
    setFormWaveformPeaks(peaks);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormAudioUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAudioFile(file);
  };

  // Open modal for new beat
  const handleOpenAdd = () => {
    const nextNumber = String(beats.length + 101).padStart(3, '0');
    const defaultId = `ASH-2026-${nextNumber}`;
    const defaultTitle = 'NEW UNTITLED BEAT';
    const slug = generateRandomSlug(defaultTitle);

    setEditTarget(null);
    setFormTitle(defaultTitle);
    setFormBeatId(defaultId);
    setFormSlug(slug);
    setFormStatus('available');
    setFormPublicNote('라이선스 미배정 / 협의 가능');
    setFormBpm(130);
    setFormKey('C Minor');
    setFormGenre('Trap / R&B');
    setFormActive(true);
    setFormAudioUrl('');
    setFormAudioFilename('');
    setFormPreviewStart(0);
    setFormFadeEnabled(true);
    setFormFadeDuration(2);
    setFormWaveformPeaks(undefined);
    setIsEditing(true);
  };

  // Open modal for editing existing beat
  const handleOpenEdit = (beat: BeatItem) => {
    setEditTarget(beat);
    setFormTitle(beat.title);
    setFormBeatId(beat.beat_id);
    setFormSlug(beat.slug);
    setFormStatus(beat.status);
    setFormPublicNote(beat.public_note || '');
    setFormBpm(beat.bpm ?? '');
    setFormKey(beat.musical_key || '');
    setFormGenre(beat.genre || '');
    setFormActive(beat.active);
    setFormAudioUrl(beat.audio_url || '');
    setFormAudioFilename(beat.audio_filename || '');
    setFormPreviewStart(beat.preview_start ?? 0);
    setFormFadeEnabled(beat.fade_enabled ?? true);
    setFormFadeDuration(beat.fade_duration ?? 2);
    setFormWaveformPeaks(beat.waveform_peaks);
    setIsEditing(true);
  };

  // Save form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTimestamp = formatCurrentKstTimestamp();

    if (editTarget) {
      const updatedList = beats.map((item) =>
        item.beat_id === editTarget.beat_id
          ? {
              ...item,
              title: formTitle.trim(),
              beat_id: formBeatId.trim(),
              slug: formSlug.trim(),
              status: formStatus,
              public_note: formPublicNote.trim(),
              bpm: typeof formBpm === 'number' ? formBpm : undefined,
              musical_key: formKey.trim() || undefined,
              genre: formGenre.trim() || undefined,
              active: formActive,
              audio_url: formAudioUrl || undefined,
              audio_filename: formAudioFilename || undefined,
              preview_duration: 15,
              preview_start: formPreviewStart,
              fade_enabled: formFadeEnabled,
              fade_duration: formFadeDuration,
              waveform_peaks: formWaveformPeaks,
              updated_at: updatedTimestamp,
            }
          : item
      );
      onUpdateBeats(updatedList);
    } else {
      const newItem: BeatItem = {
        title: formTitle.trim(),
        beat_id: formBeatId.trim(),
        slug: formSlug.trim() || generateRandomSlug(formTitle),
        status: formStatus,
        public_note: formPublicNote.trim(),
        bpm: typeof formBpm === 'number' ? formBpm : undefined,
        musical_key: formKey.trim() || undefined,
        genre: formGenre.trim() || undefined,
        active: formActive,
        audio_url: formAudioUrl || undefined,
        audio_filename: formAudioFilename || undefined,
        preview_duration: 15,
        preview_start: formPreviewStart,
        fade_enabled: formFadeEnabled,
        fade_duration: formFadeDuration,
        waveform_peaks: formWaveformPeaks,
        updated_at: updatedTimestamp,
      };
      onUpdateBeats([newItem, ...beats]);
    }

    setIsEditing(false);
  };

  // Delete beat
  const handleDeleteBeat = (beatId: string, title: string) => {
    const confirmMsg =
      language === 'ko'
        ? `'${title}' 비트를 목록에서 삭제하시겠습니까?`
        : `Are you sure you want to delete '${title}'?`;
    if (confirm(confirmMsg)) {
      const filtered = beats.filter((b) => b.beat_id !== beatId);
      onUpdateBeats(filtered);
    }
  };

  // Quick status change
  const handleQuickStatusChange = (beatId: string, newStatus: BeatStatus) => {
    const updated = beats.map((item) =>
      item.beat_id === beatId
        ? {
            ...item,
            status: newStatus,
            updated_at: formatCurrentKstTimestamp(),
          }
        : item
    );
    onUpdateBeats(updated);
  };

  // Reset to default sample beats
  const handleResetData = () => {
    const confirmMsg =
      language === 'ko'
        ? '모든 데이터를 초기 프로토타입 상태로 초기화하시겠습니까?'
        : 'Reset all beat records to original dataset?';
    if (confirm(confirmMsg)) {
      const reset = resetStoredBeats();
      onUpdateBeats(reset);
    }
  };

  // Filtered beats (search by title or genre)
  const filteredBeats = beats.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.genre && b.genre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ? true : b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // If not authenticated, render login prompt
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[75vh]">
        <RetroWindowFrame
          title="ADMIN_LOGIN_SECURITY.EXE"
          icon="sparkle"
          addressUrl="ash://admin/security/login"
          statusBarLeft="AUTH_REQUIRED"
          statusBarRight={<span className="text-[#d946ef] font-bold">SECURE_CHALLENGE</span>}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e1065]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#c084fc]">
                <Lock className="w-4 h-4 text-[#d946ef]" />
                <span className="font-bold">ADMIN ACCESS CONSOLE</span>
              </div>
              <button
                type="button"
                onClick={onExitAdmin}
                className="retro-btn text-[11px] px-2 py-0.5 text-[#e9d5ff]"
              >
                {language === 'ko' ? '나가기' : 'Exit'}
              </button>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-mono text-base font-bold text-white">
                {language === 'ko' ? '프로듀서 관리자 인증' : 'Producer Admin Access'}
              </h2>
              <p className="font-mono text-xs text-[#c084fc] leading-relaxed">
                {language === 'ko'
                  ? '비트 등록 및 라이선스 상태 관리를 위한 비밀번호를 입력하세요.'
                  : 'Enter producer password to manage beats and license availability.'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-[#c084fc] uppercase block font-pixel">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder={language === 'ko' ? '암호를 입력하세요' : 'Enter password'}
                  autoFocus
                  className="w-full retro-inset px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                />
                {authError && (
                  <div className="text-[#f43f5e] text-[11px] font-mono pt-1">
                    {language === 'ko' ? '암호가 일치하지 않습니다.' : 'Incorrect password.'}
                  </div>
                )}
              </div>

              <div className="p-2.5 retro-inset text-[11px] font-mono text-[#c084fc] bg-[#0c0419]">
                <span className="text-[#2dd4bf]">NOTE:</span> Demo password:{' '}
                <span className="text-white font-bold underline">ash2026</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-[#7c3aed] text-white font-mono text-xs font-bold border border-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:bg-[#6d28d9] cursor-pointer"
                >
                  {language === 'ko' ? '인증 및 진입' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={onExitAdmin}
                  className="retro-btn py-2 px-4 text-[#c084fc] hover:text-white font-mono text-xs cursor-pointer"
                >
                  {language === 'ko' ? '취소' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </RetroWindowFrame>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-8 space-y-6">
      <RetroWindowFrame
        title="BEAT_LICENSE_ADMIN_CONSOLE.EXE"
        icon="disc"
        addressUrl="ash://admin/license/manager"
        statusBarLeft="PRODUCER_ROOT: ACCESS_GRANTED"
        statusBarRight={<span className="text-[#2dd4bf] font-bold">ONLINE</span>}
      >
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Header inside Window */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2e1065] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#c084fc]">
                  prod by. Ash Solomo
                </span>
                <span className="text-[#581c87]">/</span>
                <span className="font-mono text-[11px] text-[#2dd4bf] flex items-center gap-1 font-bold">
                  <Unlock className="w-3 h-3" />
                  AUTHENTICATED
                </span>
              </div>
              <h1 className="font-mono text-lg sm:text-xl font-bold text-white tracking-tight">
                {language === 'ko' ? '비트 라이선스 관리자 대시보드' : 'Beat License Management Console'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExitAdmin}
                className="retro-btn flex items-center gap-1.5 py-1.5 px-3 text-xs font-mono text-[#2dd4bf] hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'ko' ? '공개 화면으로' : 'Public View'}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="retro-btn py-1.5 px-3 text-xs font-mono text-[#f43f5e] hover:bg-[#f43f5e]/20 cursor-pointer"
              >
                {language === 'ko' ? '로그아웃' : 'Logout'}
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="retro-inset p-3 bg-[#0a0314]">
              <div className="text-[#c084fc] text-[10px] uppercase font-pixel">
                {language === 'ko' ? '전체 트랙' : 'Total Tracks'}
              </div>
              <div className="text-xl font-bold text-white mt-1 tabular-nums">
                {beats.length}
              </div>
            </div>
            <div className="retro-inset p-3 bg-[#0a0314] border-l-2 border-l-[#2dd4bf]">
              <div className="text-[#2dd4bf] text-[10px] uppercase font-pixel">
                {language === 'ko' ? '이용 가능' : 'Available'}
              </div>
              <div className="text-xl font-bold text-[#2dd4bf] mt-1 tabular-nums">
                {beats.filter((b) => b.status === 'available').length}
              </div>
            </div>
            <div className="retro-inset p-3 bg-[#0a0314] border-l-2 border-l-[#f59e0b]">
              <div className="text-[#f59e0b] text-[10px] uppercase font-pixel">
                {language === 'ko' ? '확인 필요' : 'Pending'}
              </div>
              <div className="text-xl font-bold text-[#f59e0b] mt-1 tabular-nums">
                {beats.filter((b) => b.status === 'pending').length}
              </div>
            </div>
            <div className="retro-inset p-3 bg-[#0a0314] border-l-2 border-l-[#f43f5e]">
              <div className="text-[#f43f5e] text-[10px] uppercase font-pixel">
                {language === 'ko' ? '이용 불가' : 'Unavailable'}
              </div>
              <div className="text-xl font-bold text-[#f43f5e] mt-1 tabular-nums">
                {beats.filter((b) => b.status === 'unavailable').length}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search & Filter */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#a855f7] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'ko' ? '비트 제목, 장르 검색...' : 'Search title, genre...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full retro-inset text-xs font-mono text-white pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label={language === 'ko' ? '라이선스 상태 필터' : 'Filter by license status'}
                className="retro-btn text-xs font-mono text-[#c084fc] px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">{language === 'ko' ? '전체 상태' : 'All Status'}</option>
                <option value="available">{language === 'ko' ? '이용 가능 (Available)' : 'Available'}</option>
                <option value="pending">{language === 'ko' ? '확인 필요 (Pending)' : 'Pending'}</option>
                <option value="unavailable">{language === 'ko' ? '이용 불가 (Unavailable)' : 'Unavailable'}</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleResetData}
                title={language === 'ko' ? '초기 데이터셋 복구' : 'Reset default beats'}
                className="retro-btn p-2 text-[#c084fc] hover:text-white cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="retro-btn flex items-center gap-1.5 py-1.5 px-3.5 bg-[#7c3aed] text-white text-xs font-mono font-bold hover:bg-[#6d28d9] cursor-pointer border border-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              >
                <Plus className="w-3.5 h-3.5 text-[#2dd4bf]" />
                <span>{language === 'ko' ? '새 비트 등록' : 'Add New Beat'}</span>
              </button>
            </div>
          </div>

          {/* Beat Table */}
          <div className="retro-inset overflow-x-auto bg-[#070212]">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#2e1065] bg-[#120726] text-[#c084fc] uppercase text-[10px] tracking-wider font-pixel">
                  <th className="py-2.5 px-4">{language === 'ko' ? '비트 제목' : 'Beat Title'}</th>
                  <th className="py-2.5 px-4">{language === 'ko' ? '라이선스 상태' : 'License Status'}</th>
                  <th className="py-2.5 px-4">{language === 'ko' ? '최종 수정 시각' : 'Last Updated'}</th>
                  <th className="py-2.5 px-4 text-right">{language === 'ko' ? '작업' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e0a38]">
                {filteredBeats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#7e22ce]">
                      {language === 'ko'
                        ? '등록된 비트가 없거나 검색 조건과 일치하는 항목이 없습니다.'
                        : 'No beats match current filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredBeats.map((beat) => {
                    const statusColor =
                      beat.status === 'available'
                        ? 'text-[#2dd4bf]'
                        : beat.status === 'unavailable'
                        ? 'text-[#f43f5e]'
                        : 'text-[#f59e0b]';

                    const statusLabel =
                      beat.status === 'available'
                        ? (language === 'ko' ? '이용 가능' : 'AVAILABLE')
                        : beat.status === 'unavailable'
                        ? (language === 'ko' ? '이용 불가' : 'UNAVAILABLE')
                        : (language === 'ko' ? '확인 필요' : 'PENDING');

                    return (
                      <tr key={beat.beat_id} className="hover:bg-[#150729] transition-colors">
                        {/* Title */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-sm">
                            {beat.title}
                          </div>
                          {beat.genre && (
                            <div className="text-[#a855f7] text-[11px] mt-0.5">
                              {beat.genre} {beat.bpm ? `· ${beat.bpm} BPM` : ''}
                            </div>
                          )}
                        </td>

                        {/* Status with quick selector */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${statusColor}`}>
                              [{statusLabel}]
                            </span>
                            <select
                              value={beat.status}
                              onChange={(e) =>
                                handleQuickStatusChange(beat.beat_id, e.target.value as BeatStatus)
                              }
                              aria-label={`${beat.title} status change`}
                              className="retro-btn text-[11px] text-[#e9d5ff] py-0.5 px-1.5 focus:outline-none cursor-pointer"
                            >
                              <option value="available">{language === 'ko' ? '이용 가능' : 'Available'}</option>
                              <option value="pending">{language === 'ko' ? '확인 필요' : 'Pending'}</option>
                              <option value="unavailable">{language === 'ko' ? '이용 불가' : 'Unavailable'}</option>
                            </select>
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-4 text-[#c084fc] text-[11px] tabular-nums whitespace-nowrap">
                          {beat.updated_at}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onPreviewBeat(beat.beat_id)}
                              title={language === 'ko' ? '공개 확인 화면 미리보기' : 'Preview license view'}
                              className="retro-btn p-1.5 text-[#2dd4bf] hover:text-white cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(beat)}
                              title={language === 'ko' ? '비트 정보 수정' : 'Edit beat details'}
                              className="retro-btn p-1.5 text-[#c084fc] hover:text-white cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBeat(beat.beat_id, beat.title)}
                              title={language === 'ko' ? '삭제' : 'Delete'}
                              className="retro-btn p-1.5 text-[#f43f5e] hover:bg-[#f43f5e]/20 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </RetroWindowFrame>

      {/* Edit / Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 backdrop-blur-xs">
          <div className="w-full max-w-lg">
            <RetroWindowFrame
              title={editTarget ? 'EDIT_BEAT_RECORD.EXE' : 'NEW_BEAT_REGISTRATION.EXE'}
              icon="sparkle"
              addressUrl="ash://admin/license/editor"
              statusBarLeft="WRITE_MODE"
              statusBarRight={<span className="text-[#2dd4bf] font-bold">READY</span>}
            >
              <div className="p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#2e1065] pb-2">
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider font-pixel">
                    {editTarget
                      ? (language === 'ko' ? '비트 정보 및 라이선스 상태 수정' : 'Modify Beat Details')
                      : (language === 'ko' ? '새 비트 등록' : 'Add New Beat')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="retro-btn text-[11px] px-2 py-0.5 text-[#f43f5e] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveForm} className="space-y-3.5 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[#c084fc] uppercase text-[10px] block font-pixel">
                      {language === 'ko' ? '비트 제목 (TITLE)' : 'TRACK TITLE'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => {
                        setFormTitle(e.target.value);
                        if (!editTarget) {
                          setFormSlug(generateRandomSlug(e.target.value));
                        }
                      }}
                      className="w-full retro-inset text-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#c084fc] uppercase text-[10px] block font-pixel">
                      {language === 'ko' ? '라이선스 상태 (STATUS)' : 'LICENSE STATUS'}
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as BeatStatus)}
                      className="w-full retro-inset text-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                    >
                      <option value="available">
                        {language === 'ko' ? '이용 가능 (Available)' : 'Available (Mint)'}
                      </option>
                      <option value="pending">
                        {language === 'ko' ? '확인 필요 (Pending)' : 'Pending (Amber)'}
                      </option>
                      <option value="unavailable">
                        {language === 'ko' ? '이용 불가 (Unavailable)' : 'Unavailable (Pink/Red)'}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#c084fc] uppercase text-[10px] block font-pixel">
                      {language === 'ko' ? '공개 안내 메모 (PUBLIC NOTE)' : 'PUBLIC NOTICE MEMO'}
                    </label>
                    <input
                      type="text"
                      value={formPublicNote}
                      onChange={(e) => setFormPublicNote(e.target.value)}
                      placeholder={
                        language === 'ko'
                          ? '예: 라이선스 협의 가능, 1차 가이드 보컬 대기'
                          : 'e.g. Open for inquiry, guide vocals pending'
                      }
                      className="w-full retro-inset text-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[#c084fc] uppercase text-[10px] block font-pixel">
                        BPM
                      </label>
                      <input
                        type="number"
                        value={formBpm}
                        onChange={(e) =>
                          setFormBpm(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full retro-inset text-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#c084fc] uppercase text-[10px] block font-pixel">
                        KEY
                      </label>
                      <input
                        type="text"
                        value={formKey}
                        onChange={(e) => setFormKey(e.target.value)}
                        placeholder="C Minor"
                        className="w-full retro-inset text-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#c084fc] uppercase text-[10px] block font-pixel">
                        GENRE
                      </label>
                      <input
                        type="text"
                        value={formGenre}
                        onChange={(e) => setFormGenre(e.target.value)}
                        placeholder="Trap"
                        className="w-full retro-inset text-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                      />
                    </div>
                  </div>

                  {/* MP3 Audio Upload and 15-second Preview settings */}
                  <div className="p-3 retro-inset space-y-3 bg-[#0a0314]">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-bold uppercase text-[11px] flex items-center gap-1.5 font-pixel">
                        <Music className="w-3.5 h-3.5 text-[#2dd4bf]" />
                        <span>{language === 'ko' ? 'MP3 파일 & 15초 미리듣기 설정' : 'Audio File & 15s Preview'}</span>
                      </label>
                      <span className="text-[10px] text-[#2dd4bf] border border-[#2dd4bf]/40 px-1.5 py-0.2 font-mono">
                        15s Fixed
                      </span>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processAudioFile(file);
                      }}
                      className={`border-2 border-dashed p-3 text-center transition-all ${
                        isDragging
                          ? 'border-[#2dd4bf] bg-[#1a0833]'
                          : 'border-[#581c87] hover:border-[#a855f7] bg-[#070212]'
                      }`}
                    >
                      <input
                        type="file"
                        id="audioFileInput"
                        accept="audio/*,.mp3,.wav,.m4a"
                        onChange={handleAudioFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="audioFileInput"
                        className="flex flex-col items-center justify-center cursor-pointer space-y-1"
                      >
                        <Upload className="w-5 h-5 text-[#c084fc] hover:text-white transition-colors" />
                        <div className="text-xs text-white font-semibold">
                          {language === 'ko'
                            ? 'MP3 파일을 드래그 앤 드롭하거나 클릭하여 선택'
                            : 'Drag and drop audio file or click to browse'}
                        </div>
                        <div className="text-[10px] text-[#a855f7]">
                          .mp3, .wav, .m4a (15s Cap & Waveform extraction)
                        </div>
                      </label>

                      {formAudioFilename && (
                        <div className="mt-2 pt-2 border-t border-[#2e1065] flex items-center justify-between bg-[#120726] px-3 py-1 border border-[#581c87]">
                          <div className="flex items-center gap-2 truncate text-xs text-white">
                            <Music className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                            <span className="truncate">{formAudioFilename}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormAudioUrl('');
                              setFormAudioFilename('');
                              setFormWaveformPeaks(undefined);
                            }}
                            className="text-[#c084fc] hover:text-[#f43f5e] text-[11px] p-0.5 cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Preview Timing & Fade Setting Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#2e1065]">
                      <div className="space-y-1">
                        <label className="text-[#c084fc] uppercase text-[10px] block font-pixel">
                          {language === 'ko' ? '시작 지점 (초)' : 'Start Offset (sec)'}
                        </label>
                        <input
                          type="number"
                          value={formPreviewStart}
                          onChange={(e) => setFormPreviewStart(Number(e.target.value) || 0)}
                          min={0}
                          placeholder="0"
                          className="w-full retro-inset text-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#c084fc] uppercase text-[10px] block font-pixel">
                          {language === 'ko' ? '페이드 효과' : 'Fade FX'}
                        </label>
                        <div className="flex items-center gap-2 pt-0.5">
                          <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formFadeEnabled}
                              onChange={(e) => setFormFadeEnabled(e.target.checked)}
                              className="accent-[#a855f7]"
                            />
                            <span>{language === 'ko' ? '페이드 적용' : 'Enable Fade'}</span>
                          </label>
                          {formFadeEnabled && (
                            <select
                              value={formFadeDuration}
                              onChange={(e) => setFormFadeDuration(Number(e.target.value))}
                              className="retro-btn text-xs text-white px-1.5 py-0.5"
                            >
                              <option value={1.5}>1.5s</option>
                              <option value={2}>2s</option>
                              <option value={3}>3s</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Player inside form */}
                    {(formAudioUrl || formAudioFilename) && (
                      <div className="pt-2 border-t border-[#2e1065] space-y-1">
                        <div className="text-[10px] text-[#2dd4bf] font-semibold flex items-center gap-1 font-pixel">
                          <Sparkles className="w-3 h-3" />
                          <span>{language === 'ko' ? '업로드 전 15초 미리듣기 테스트' : '15s Audio Preview Check'}</span>
                        </div>
                        <AudioPreviewPlayer
                          audioUrl={formAudioUrl}
                          filename={formAudioFilename}
                          previewStart={formPreviewStart}
                          fadeEnabled={formFadeEnabled}
                          fadeDuration={formFadeDuration}
                          waveformPeaks={formWaveformPeaks}
                          trackTitle={formTitle}
                          bpm={typeof formBpm === 'number' ? formBpm : 130}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="activeCheck"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="accent-[#a855f7]"
                    />
                    <label htmlFor="activeCheck" className="text-[#c084fc] text-xs cursor-pointer">
                      {language === 'ko' ? '비트 활성화 (Active)' : 'Track Active'}
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2e1065]">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="retro-btn py-1.5 px-3 text-[#c084fc] hover:text-white cursor-pointer"
                    >
                      {language === 'ko' ? '취소' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="py-1.5 px-4 bg-[#7c3aed] text-white font-bold text-xs border border-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:bg-[#6d28d9] cursor-pointer"
                    >
                      {language === 'ko' ? '저장 및 타임스탬프 기록' : 'Save Track'}
                    </button>
                  </div>
                </form>
              </div>
            </RetroWindowFrame>
          </div>
        </div>
      )}
    </div>
  );
};
