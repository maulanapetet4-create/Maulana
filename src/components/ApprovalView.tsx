import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Printer, 
  ArrowLeft, 
  Share2, 
  Send, 
  FileText, 
  AlertTriangle,
  Layers,
  Ruler,
  Wrench,
  Cpu,
  History,
  ArrowRight,
  BadgeCheck,
  FileSpreadsheet
} from 'lucide-react';
import { CncDailyReport } from '../types';
import { processSupervisorApproval, processGmApproval, getApprovalUrl } from '../services/reportStorage';
import { exportSingleReportToCsv } from '../services/csvExport';

interface ApprovalViewProps {
  report: CncDailyReport;
  role: 'supervisor' | 'gm';
  onUpdateReport: (updated: CncDailyReport) => void;
  onNavigateDashboard: () => void;
  onNavigatePrint: (report: CncDailyReport) => void;
  onOpenShareModal: (report: CncDailyReport) => void;
}

export const ApprovalView: React.FC<ApprovalViewProps> = ({
  report,
  role,
  onUpdateReport,
  onNavigateDashboard,
  onNavigatePrint,
  onOpenShareModal,
}) => {
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const approverTitle = role === 'supervisor' 
    ? `Supervisor: ${report.supervisorName} (Mulyana)` 
    : `General Manager: ${report.gmName} (Arifin)`;

  const isSupervisorTurn = role === 'supervisor' && report.status === 'PENDING_SUPERVISOR';
  const isGmTurn = role === 'gm' && report.status === 'PENDING_GM';
  const canTakeAction = isSupervisorTurn || isGmTurn;

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let updated: CncDailyReport;
      if (role === 'supervisor') {
        updated = processSupervisorApproval(
          report.id, 
          decision, 
          notes || (decision === 'APPROVED' ? 'Hasil potong rapi dan dimensi sesuai toleransi gambar kerja.' : 'Mohon periksa kembali data sheet.'),
          report.supervisorName
        );
        setFeedbackSuccess('Laporan telah berhasil diverifikasi oleh Supervisor Mulyana dan otomatis dialihkan ke status PENDING GM (Arifin).');
      } else {
        updated = processGmApproval(
          report.id, 
          decision, 
          notes || (decision === 'APPROVED' ? 'Disetujui. Lanjutkan produksi.' : 'Mohon tinjau ulang dimensi.'),
          report.gmName
        );
        setFeedbackSuccess('Laporan telah disahkan final oleh General Manager Arifin (Status: APPROVED)!');
      }

      onUpdateReport(updated);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses approval.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportSingleExcel = () => {
    exportSingleReportToCsv(report);
  };

  // Calculations for summary stats
  const totalQuickComps = report.sectionB_Quick.reduce(
    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0), 
    0
  );
  const totalTekmaComps = report.sectionC_Tekma.reduce(
    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0), 
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onNavigateDashboard}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Riwayat</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenShareModal(report)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Bagikan / Backup</span>
          </button>

          {/* Export Excel Button for Phone / PC */}
          <button
            onClick={handleExportSingleExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition"
            title="Download laporan ini dalam format Excel (.csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Unduh Excel</span>
          </button>

          {/* Print / Save PDF Button */}
          <button
            onClick={() => onNavigatePrint(report)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            title="Buka lembar cetak standar fisik A4 / Cetak PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Role Banner */}
      <div className={`p-5 rounded-2xl border text-white shadow-md ${
        role === 'supervisor'
          ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 border-amber-600'
          : 'bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 border-purple-500'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white">
              {role === 'supervisor' ? <UserCheck className="w-6 h-6 text-amber-300" /> : <ShieldCheck className="w-6 h-6 text-purple-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  {role === 'supervisor' ? 'Level 1: Persetujuan Supervisor' : 'Level 2: Persetujuan GM'}
                </span>
                <span className="text-xs text-white/80 font-mono">ID: {report.id}</span>
              </div>
              <h2 className="text-xl font-bold mt-0.5">{approverTitle}</h2>
              <p className="text-xs text-white/80">
                Silakan periksa lembar kerja mesin CNC, volume oli, pergantian pisau, dan pemakaian material berikut.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-white/70">Status Laporan Saat Ini</div>
              <div className="text-sm font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                {report.status === 'APPROVED' ? 'Selesai / Approved' :
                 report.status === 'PENDING_SUPERVISOR' ? 'Menunggu Supervisor (Mulyana)' :
                 report.status === 'PENDING_GM' ? 'Menunggu GM (Arifin)' :
                 report.status === 'REJECTED' ? 'Ditolak / Perlu Revisi' : 'Draft'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start justify-between gap-3 text-emerald-800 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Persetujuan Berhasil Disimpan!</h4>
              <p className="text-xs mt-0.5">{feedbackSuccess}</p>
            </div>
          </div>

          {report.status === 'APPROVED' && (
            <button
              onClick={() => onNavigatePrint(report)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Formulir PDF Sekarang</span>
            </button>
          )}

          {report.status === 'PENDING_GM' && role === 'supervisor' && (
            <button
              onClick={() => onOpenShareModal(report)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Link ke GM (Arifin)</span>
            </button>
          )}
        </div>
      )}

      {/* APPROVAL ACTION BOX (If eligible) */}
      {canTakeAction ? (
        <div className="bg-white rounded-xl shadow-md border-2 border-blue-500 overflow-hidden">
          <div className="bg-blue-600 text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <UserCheck className="w-4 h-4" />
              <span>Panel Keputusan Persetujuan: {role === 'supervisor' ? 'Mulyana (Supervisor)' : 'Arifin (GM)'}</span>
            </div>
            <span className="text-xs bg-blue-700 px-2.5 py-0.5 rounded font-medium">Tindakan Diperlukan</span>
          </div>

          <form onSubmit={handleDecisionSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Keputusan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  decision === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="APPROVED"
                    checked={decision === 'APPROVED'}
                    onChange={() => setDecision('APPROVED')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Setujui (Approve)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {role === 'supervisor'
                        ? 'Data valid, teruskan ke General Manager (Arifin).'
                        : 'Sahkan laporan harian sebagai dokumen final.'}
                    </p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  decision === 'REJECTED'
                    ? 'border-red-500 bg-red-50/70 text-red-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="REJECTED"
                    checked={decision === 'REJECTED'}
                    onChange={() => setDecision('REJECTED')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Tolak / Perlu Revisi</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Kembalikan ke operator untuk perbaikan data fisik atau pengerjaan ulang.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Instruksi Tambahan {role === 'supervisor' ? 'Supervisor' : 'General Manager'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  role === 'supervisor'
                    ? 'Contoh: Part cover SASA potongannya sudah rapi, dimensi sesuai toleransi ±0.2mm. Diteruskan ke GM.'
                    : 'Contoh: Disetujui. Lanjutkan pemotongan tray batch berikutnya shift 2.'
                }
                rows={3}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={isProcessing}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition ${
                  decision === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {decision === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>
                  {isProcessing ? 'Memproses...' : decision === 'APPROVED' ? 'Konfirmasi & Setujui' : 'Kirim Penolakan'}
                </span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              {report.status === 'APPROVED'
                ? 'Laporan ini telah disetujui penuh oleh Supervisor dan General Manager.'
                : report.status === 'PENDING_GM' && role === 'supervisor'
                ? 'Laporan telah disetujui oleh Supervisor dan saat ini sedang menunggu persetujuan General Manager (Arifin).'
                : report.status === 'PENDING_SUPERVISOR' && role === 'gm'
                ? 'Laporan masih dalam antrean review Supervisor Mulyana sebelum diteruskan ke GM.'
                : 'Laporan ini tidak dalam giliran persetujuan Anda.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSingleExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>

            {report.status === 'APPROVED' && (
              <button
                onClick={() => onNavigatePrint(report)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Hasil Final</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===================== SUMMARY PREVIEW OF ENTIRE PHYSICAL FORM ===================== */}

      {/* HEADER SUMMARY */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Informasi Dasar Laporan</span>
          <span>SPK: {report.sasaNo}</span>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Operator</span>
            <span className="font-bold text-slate-800">{report.operatorName}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Shift</span>
            <span className="font-bold text-slate-800">{report.shift}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Hari & Tanggal</span>
            <span className="font-semibold text-slate-800">{report.dayAndDate}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Jam Kerja</span>
            <span className="font-semibold text-slate-800">{report.workStartTime} - {report.workEndTime}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 col-span-2">
            <span className="text-slate-400 text-[10px] block">Project</span>
            <span className="font-bold text-blue-700">{report.project}</span>
          </div>
        </div>
      </div>

      {/* BAGIAN A: PERAWATAN MESIN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bagian A: Perawatan Mesin (Oli & Mata Pisau)</span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
            <span className="text-slate-500 text-[11px] block">Volume Pengisian Oli</span>
            <span className="text-base font-bold text-slate-800">{report.sectionA.oilFillVolumeMl || 0} mL</span>
          </div>
          <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
            <span className="text-slate-500 text-[11px] block">Ketinggian / Level Oli</span>
            <span className="text-base font-bold text-emerald-600">{report.sectionA.oilLevel || 'Normal'}</span>
          </div>
          <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
            <span className="text-slate-500 text-[11px] block">Mata Pisau V-Cut</span>
            <span className="font-bold text-slate-800">
              {report.sectionA.bladeChanges.vcut.replaced ? 'Diganti Baru' : 'Tidak Diganti'}
            </span>
            {report.sectionA.bladeChanges.vcut.changeDate && (
              <span className="block text-[10px] text-slate-500">Tgl: {report.sectionA.bladeChanges.vcut.changeDate}</span>
            )}
          </div>
          <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
            <span className="text-slate-500 text-[11px] block">End Mill 3mm & 6mm</span>
            <span className="font-bold text-slate-800">
              3mm: {report.sectionA.bladeChanges.endmill3mm.replaced ? 'Diganti' : 'OK'} | 6mm: {report.sectionA.bladeChanges.endmill6mm.replaced ? 'Diganti' : 'OK'}
            </span>
          </div>
        </div>
      </div>

      {/* BAGIAN B & C: REKAP MESIN ROUTER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CNC QUICK */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-700 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Bagian B: CNC Quick (Putih)</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Total: {totalQuickComps} Pcs</span>
          </div>
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b text-[10px] uppercase">
                  <th className="p-1.5">S#</th>
                  <th className="p-1.5">Produk</th>
                  <th className="p-1.5">Material</th>
                  <th className="p-1.5 text-center">Waktu</th>
                  <th className="p-1.5 text-center">Delay</th>
                  <th className="p-1.5 text-right">Hasil</th>
                  <th className="p-1.5 text-center">QC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {report.sectionB_Quick.map((s) => (
                  <tr key={s.sheetNumber} className="hover:bg-slate-50">
                    <td className="p-1.5 font-bold font-mono">{s.sheetNumber}</td>
                    <td className="p-1.5 font-medium">{s.productName || '-'}</td>
                    <td className="p-1.5 text-slate-500">{s.materialType || '-'}</td>
                    <td className="p-1.5 text-center">{s.processTime ? `${s.processTime}m` : '-'}</td>
                    <td className="p-1.5 text-center text-amber-600">{s.delayTime ? `${s.delayTime}m` : '-'}</td>
                    <td className="p-1.5 text-right font-bold text-blue-600">{s.totalComponents || '-'}</td>
                    <td className="p-1.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        s.quality === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {s.quality}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CNC TEKMA */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-blue-900 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bagian C: CNC Tekma (Biru)</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Total: {totalTekmaComps} Pcs</span>
          </div>
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b text-[10px] uppercase">
                  <th className="p-1.5">S#</th>
                  <th className="p-1.5">Produk</th>
                  <th className="p-1.5">Material</th>
                  <th className="p-1.5 text-center">Waktu</th>
                  <th className="p-1.5 text-center">Delay</th>
                  <th className="p-1.5 text-right">Hasil</th>
                  <th className="p-1.5 text-center">QC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {report.sectionC_Tekma.map((s) => (
                  <tr key={s.sheetNumber} className="hover:bg-slate-50">
                    <td className="p-1.5 font-bold font-mono">{s.sheetNumber}</td>
                    <td className="p-1.5 font-medium">{s.productName || '-'}</td>
                    <td className="p-1.5 text-slate-500">{s.materialType || '-'}</td>
                    <td className="p-1.5 text-center">{s.processTime ? `${s.processTime}m` : '-'}</td>
                    <td className="p-1.5 text-center text-amber-600">{s.delayTime ? `${s.delayTime}m` : '-'}</td>
                    <td className="p-1.5 text-right font-bold text-blue-600">{s.totalComponents || '-'}</td>
                    <td className="p-1.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        s.quality === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {s.quality}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BAGIAN D & E: MATERIAL & DIMENSI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION D: PEMAKAIAN MATERIAL PP */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Bagian D: Pemakaian Material PP Flute</span>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3 text-xs">
            <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
              <span className="font-bold text-slate-800 block">PP Board G4mm</span>
              <div className="mt-1 flex justify-between">
                <span className="text-slate-500">Terpakai:</span>
                <span className="font-bold">{report.sectionD.ppG4mm?.lembar || 0} Lembar</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Sisa:</span>
                <span className="truncate max-w-[80px]">{report.sectionD.ppG4mm?.sisa || '-'}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
              <span className="font-bold text-slate-800 block">PP Board 8mm</span>
              <div className="mt-1 flex justify-between">
                <span className="text-slate-500">Terpakai:</span>
                <span className="font-bold">{report.sectionD.pp8mm?.lembar || 0} Lembar</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Sisa:</span>
                <span className="truncate max-w-[80px]">{report.sectionD.pp8mm?.sisa || '-'}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
              <span className="font-bold text-slate-800 block">PP Board F10mm</span>
              <div className="mt-1 flex justify-between">
                <span className="text-slate-500">Terpakai:</span>
                <span className="font-bold">{report.sectionD.ppF10mm?.lembar || 0} Lembar</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Sisa:</span>
                <span className="truncate max-w-[80px]">{report.sectionD.ppF10mm?.sisa || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION E: TOLERANSI & DIMENSI */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5 text-purple-400" />
            <span>Bagian E: Pengecekan Dimensi & Toleransi</span>
          </div>
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b text-[10px] uppercase">
                  <th className="p-1.5">Sheet</th>
                  <th className="p-1.5">Panjang (L)</th>
                  <th className="p-1.5">Lebar (W)</th>
                  <th className="p-1.5">Tebal (T)</th>
                  <th className="p-1.5">Catatan / Akurasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {report.sectionE.map((dim) => (
                  <tr key={dim.sheetNumber} className="hover:bg-slate-50">
                    <td className="p-1.5 font-bold font-mono">Sheet {dim.sheetNumber}</td>
                    <td className="p-1.5 font-mono">{dim.lengthMm ? `${dim.lengthMm} mm` : '-'}</td>
                    <td className="p-1.5 font-mono">{dim.widthMm ? `${dim.widthMm} mm` : '-'}</td>
                    <td className="p-1.5 font-mono">{dim.thicknessMm ? `${dim.thicknessMm} mm` : '-'}</td>
                    <td className="p-1.5 text-slate-600">{dim.toleranceNotes || 'Sesuai spesifikasi'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BAGIAN F: CATATAN KENDALA & PESAN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b pb-2">
          Bagian F: Catatan Shift, Pesan Informasi & Kendala Mesin
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Pekerjaan Lain:</span>
            <p className="text-slate-600 leading-relaxed">{report.sectionF.otherWork || 'Tidak ada pekerjaan lain di luar SPK.'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Pesan / Informasi Shift:</span>
            <p className="text-slate-600 leading-relaxed">{report.sectionF.messageOrInfo || 'Kondisi kerja normal.'}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="font-bold text-amber-900 block mb-1">Kendala / Masalah:</span>
            <p className="text-amber-800 leading-relaxed">{report.sectionF.issues || 'Mesin berjalan lancar tanpa kendala teknis.'}</p>
          </div>
        </div>
      </div>

      {/* RIWAYAT AUDIT & PERSETUJUAN (TIMELINE) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-blue-600" />
          <span>Riwayat Alur Persetujuan Bertingkat (Audit Trail)</span>
        </h4>
        <div className="mt-4 space-y-4">
          {report.timeline && report.timeline.length > 0 ? (
            report.timeline.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white ${
                  step.action === 'APPROVED' ? 'bg-emerald-600' :
                  step.action === 'REJECTED' ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  {step.action === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> :
                   step.action === 'REJECTED' ? <XCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {step.role}: {step.actorName} ({step.action})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(step.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{step.note}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">Belum ada riwayat aktivitas.</p>
          )}
        </div>
      </div>
    </div>
  );
};
