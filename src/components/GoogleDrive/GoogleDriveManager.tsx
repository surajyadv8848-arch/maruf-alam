import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from '../../services/firebase';
import {
  listDriveFiles,
  uploadReportToDrive,
  getDriveFileContent,
  deleteDriveFile,
  GoogleDriveFile,
} from '../../services/googleDrive';
import {
  HardDrive,
  Cloud,
  FileText,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Upload,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface GoogleDriveManagerProps {
  themeMode?: 'dark' | 'light';
  currentReportData?: {
    title: string;
    bloodGroup?: string;
    details: string;
    sampleId?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  themeMode = 'dark',
  currentReportData,
  isOpen,
  onClose,
}) => {
  const isDark = themeMode === 'dark';
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Files state
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Preview file modal
  const [previewFile, setPreviewFile] = useState<{ name: string; content: string } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  // Deletion confirmation modal (MANDATORY per Workspace Integration skill)
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Uploading state
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Listen to auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchFiles = useCallback(async (search = searchQuery) => {
    const currentToken = token || (await getAccessToken());
    if (!currentToken) return;

    setIsLoadingFiles(true);
    try {
      const driveFiles = await listDriveFiles(currentToken, search);
      setFiles(driveFiles);
    } catch (err: unknown) {
      console.error(err);
      setActionMessage({
        text: err instanceof Error ? err.message : 'Could not load Google Drive files',
        type: 'error',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  }, [token, searchQuery]);

  // Fetch files when user is authenticated
  useEffect(() => {
    if (user && token && isOpen) {
      fetchFiles();
    }
  }, [user, token, isOpen, fetchFiles]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setActionMessage({ text: 'Connected to Google Drive successfully!', type: 'success' });
      }
    } catch (err: unknown) {
      console.error(err);
      setAuthError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setFiles([]);
    setActionMessage({ text: 'Signed out of Google Drive', type: 'success' });
  };

  const handleSaveCurrentReport = async () => {
    if (!currentReportData) return;
    const currentToken = token || (await getAccessToken());
    if (!currentToken) {
      setAuthError('Please connect your Google account first');
      return;
    }

    setIsUploading(true);
    setActionMessage(null);
    try {
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const blood = currentReportData.bloodGroup ? `[${currentReportData.bloodGroup}]` : '';
      const fileName = `HemoMatch-Report-${blood}-${dateStr}.txt`;

      const formattedContent = `=================================================================
HEMOMATCH VIRTUAL IMMUNOHEMATOLOGY LABORATORY REPORT
Station System: HemoMatch Diagnostics
Creator: Maruf (Made by Maruf)
Timestamp: ${new Date().toLocaleString()}
=================================================================

REPORT SUMMARY:
Title: ${currentReportData.title}
Blood Group: ${currentReportData.bloodGroup || 'Unspecified'}
Sample Reference: ${currentReportData.sampleId || 'LAB-SIM-AUTO'}

CLINICAL & COMPATIBILITY DETAILS:
${currentReportData.details}

-----------------------------------------------------------------
Antisera Reagents Standard: Monoclonal Anti-A, Anti-B, Anti-D
Compatibility Rules: Landsteiner's ABO Law & RhD Transfusion Safety
Verified & Certified by: Maruf
Platform: HemoMatch Laboratory Station (Made by Maruf)
=================================================================`;

      const uploaded = await uploadReportToDrive(currentToken, fileName, formattedContent, 'text/plain');
      setActionMessage({
        text: `Report saved to Google Drive as "${uploaded.name}"!`,
        type: 'success',
      });
      await fetchFiles();
    } catch (err: unknown) {
      console.error(err);
      setActionMessage({
        text: err instanceof Error ? err.message : 'Failed to save report to Google Drive',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewFile = async (file: GoogleDriveFile) => {
    const currentToken = token || (await getAccessToken());
    if (!currentToken) return;

    setIsLoadingPreview(true);
    try {
      const content = await getDriveFileContent(currentToken, file.id);
      setPreviewFile({ name: file.name, content });
    } catch (err: unknown) {
      console.error(err);
      setActionMessage({
        text: 'Unable to preview file content. File might be non-text or restricted.',
        type: 'error',
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const currentToken = token || (await getAccessToken());
    if (!currentToken) return;

    setIsDeleting(true);
    try {
      await deleteDriveFile(currentToken, fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setActionMessage({
        text: `File "${fileToDelete.name}" permanently deleted from Google Drive.`,
        type: 'success',
      });
      setFileToDelete(null);
    } catch (err: unknown) {
      console.error(err);
      setActionMessage({
        text: err instanceof Error ? err.message : 'Failed to delete file',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-indigo-950/80 backdrop-blur-md animate-bio-fade-in-up">
      <div
        className={`rounded-2xl shadow-2xl border w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden transition-all ${
          isDark
            ? 'bg-[#0a0d1d] border-indigo-900/60 text-slate-100 shadow-[0_0_50px_rgba(99,102,241,0.25)]'
            : 'bg-white border-indigo-100 text-slate-900 shadow-2xl shadow-indigo-500/10'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            isDark
              ? 'bg-[#0d1226] border-indigo-900/50 text-white'
              : 'bg-indigo-50/70 border-indigo-100 text-indigo-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
                isDark ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-indigo-400/40' : 'bg-indigo-600 text-white border-indigo-600'
              }`}
            >
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-bold text-base sm:text-lg">Google Drive Storage</h2>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isDark ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400/30' : 'bg-indigo-600 text-white border-indigo-600'
                  }`}
                >
                  Made by Maruf
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-indigo-300/80' : 'text-indigo-700/80'}`}>
                Cloud sync &amp; archive for blood typing &amp; compatibility examination reports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
              isDark
                ? 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300 hover:bg-indigo-900 hover:text-white'
                : 'bg-indigo-100 border-indigo-200 text-indigo-800 hover:bg-indigo-200 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action feedback banner */}
        {actionMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-mono font-medium flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border-b border-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs font-bold hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* User Auth Section */}
          {!user ? (
            <div
              className={`border rounded-xl p-6 text-center ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 mx-auto flex items-center justify-center text-rose-400 mb-3">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="font-mono font-bold text-base mb-1">
                Connect your Google Drive
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Sign in to save immunohematology test records, patient crossmatch evaluations,
                and agglutination certificates directly to your Google Drive.
              </p>

              {authError && (
                <p className="text-xs text-rose-400 font-mono font-semibold mb-3">{authError}</p>
              )}

              {/* Official Google Sign In Button */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn || isLoadingAuth}
                className="inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-lg border border-[#dadce0] bg-white text-[#3c4043] font-medium text-xs hover:bg-[#f8f9fa] hover:shadow-xs transition-all active:bg-[#f1f3f4] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                <span>{isSigningIn ? 'Connecting to Google Drive...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User Profile Bar */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-9 h-9 rounded-full border border-rose-500"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold font-mono">
                      {user.displayName || 'Google Account'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    Drive Synced
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Sign out of Google"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Save Current Report Banner */}
              {currentReportData && (
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                    isDark
                      ? 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/40'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Report Ready to Export to Drive:</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 font-medium">
                      {currentReportData.title}{' '}
                      {currentReportData.bloodGroup && (
                        <span className="font-mono font-black text-rose-400">
                          ({currentReportData.bloodGroup})
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={handleSaveCurrentReport}
                    disabled={isUploading}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Save to Drive'}</span>
                  </button>
                </div>
              )}

              {/* Search & Refresh controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchFiles(searchQuery);
                    }}
                    placeholder="Search Google Drive reports..."
                    className={`w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-hidden focus:ring-1 focus:ring-rose-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <button
                  onClick={() => fetchFiles(searchQuery)}
                  disabled={isLoadingFiles}
                  title="Refresh files"
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Files List */}
              <div
                className={`border rounded-xl overflow-hidden ${
                  isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
                }`}
              >
                <div
                  className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono font-bold ${
                    isDark
                      ? 'bg-slate-900/80 border-slate-800 text-slate-400'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>Google Drive Documents</span>
                  <span>{files.length} items</span>
                </div>

                {isLoadingFiles ? (
                  <div className="p-8 text-center text-xs font-mono text-slate-400">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin text-rose-500 mb-2" />
                    Querying Google Drive files...
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-slate-400">
                    <FileText className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-300">No reports found</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Save a lab blood typing result to create your first archived report.
                    </p>
                  </div>
                ) : (
                  <div className={`divide-y max-h-72 overflow-y-auto ${isDark ? 'divide-slate-900' : 'divide-slate-100'}`}>
                    {files.map((file) => {
                      const isHemoMatch = file.name.includes('HemoMatch');
                      return (
                        <div
                          key={file.id}
                          className={`px-4 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                            isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isHemoMatch
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 font-mono">
                              <p className="font-semibold truncate">{file.name}</p>
                              <p className="text-[10px] text-slate-500">
                                {file.modifiedTime
                                  ? new Date(file.modifiedTime).toLocaleDateString()
                                  : 'Recent'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Preview */}
                            <button
                              onClick={() => handlePreviewFile(file)}
                              title="Preview report"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Open in Drive */}
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open in Google Drive"
                                className="p-1 rounded-md text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Delete (Requires Confirmation) */}
                            <button
                              onClick={() => setFileToDelete(file)}
                              title="Delete from Google Drive"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`border-t px-5 py-3 flex items-center justify-between text-xs font-mono ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <span className="font-bold text-rose-400">HemoMatch × Google Drive · Made by Maruf</span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border font-bold transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>

      {/* Preview Content Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col border overflow-hidden ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <h4 className="font-mono font-bold text-xs truncate max-w-sm">{previewFile.name}</h4>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className={`p-4 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap flex-1 ${
                isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-800'
              }`}
            >
              {isLoadingPreview ? 'Reading file from Google Drive...' : previewFile.content}
            </div>
            <div className={`px-4 py-2.5 border-t text-right ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Deletions */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-rose-500/50 overflow-hidden animate-bio-shake text-slate-100">
            <div className="px-5 py-4 bg-rose-950/40 border-b border-rose-800/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-mono font-bold text-rose-400 text-sm">
                  Confirm Permanent Deletion
                </h4>
                <p className="text-xs text-rose-300/80">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-5 text-xs text-slate-300 space-y-2 font-mono">
              <p>
                Are you sure you want to delete{' '}
                <strong className="text-rose-400 font-semibold">"{fileToDelete.name}"</strong> from your Google Drive?
              </p>
              <p className="text-[11px] text-slate-400">
                The file will be permanently removed from your Google Drive account.
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete File'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
