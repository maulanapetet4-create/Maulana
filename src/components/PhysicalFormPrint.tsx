import React from 'react';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, UserCheck, FileSpreadsheet } from 'lucide-react';
import { CncDailyReport } from '../types';
import { LabtechLogo } from './LabtechLogo';
import { exportSingleReportToCsv } from '../services/csvExport';

interface PhysicalFormPrintProps {
  report: CncDailyReport;
  onBack: () => void;
}

export const PhysicalFormPrint: React.FC<PhysicalFormPrintProps> = ({
  report,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportSingleReportToCsv(report);
  };

  const totalQuickComps = report.sectionB_Quick.reduce(
    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0),
    0
  );
  const totalTekmaComps = report.sectionC_Tekma.reduce(
    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-2 sm:px-6">
      {/* Print Controls (Hidden when printing) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Laporan</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {/* Download Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition"
            title="Download laporan fisik ini sebagai file Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Unduh Excel (.csv)</span>
          </button>

          {/* Print PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
            title="Cetak langsung ke printer atau Simpan sebagai PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* ===================== PHYSICAL PAPER FORM REPLICA ===================== */}
      <div className="print-page max-w-4xl mx-auto bg-white p-8 sm:p-10 shadow-lg border border-slate-400 text-slate-900 text-[11px] leading-tight font-sans">
        {/* KOP / Header Dokumen Resmi Manufaktur */}
        <div className="border-2 border-slate-900 mb-3">
          <div className="grid grid-cols-12 divide-x-2 divide-slate-900">
            {/* Logo & Company */}
            <div className="col-span-3 p-2.5 flex flex-col justify-center items-center text-center bg-slate-50">
              <LabtechLogo size="md" showText={false} />
              <div className="font-extrabold text-[11px] uppercase tracking-wider text-slate-900 mt-1">
                PT LABTECH INDONESIA
              </div>
              <div className="text-[8px] text-slate-500 font-medium">
                Precision Manufacturing & Assembly
              </div>
            </div>

            {/* Document Title */}
            <div className="col-span-6 p-2 flex flex-col justify-center items-center text-center">
              <h1 className="font-black text-base uppercase tracking-wider text-slate-900">
                LAPORAN HARIAN MESIN CNC ROUTER
              </h1>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                DIVISI PRODUKSI • FORMULIR KONTROL PRESISI FISIK
              </span>
              <div className="text-[9px] text-slate-500 mt-1 font-mono">
                No. Dok: LAB-FR-CNC-004 • Rev: 02 • Berlaku: 2026
              </div>
            </div>

            {/* Document Metadata / SPK No */}
            <div className="col-span-3 p-2 text-[9px] flex flex-col justify-between bg-slate-50">
              <div>
                <span className="text-slate-500 block">ID Laporan:</span>
                <span className="font-mono font-bold text-slate-900 text-[11px]">{report.id}</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-500 block">Status Dokumen:</span>
                <span className={`font-bold uppercase ${
                  report.status === 'APPROVED' ? 'text-emerald-700' :
                  report.status === 'PENDING_GM' ? 'text-purple-700' :
                  report.status === 'PENDING_SUPERVISOR' ? 'text-amber-700' : 'text-slate-700'
                }`}>
                  {report.status}
                </span>
              </div>
            </div>
          </div>

          {/* Header Data Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x-2 divide-y-2 sm:divide-y-0 divide-slate-900 border-t-2 border-slate-900 bg-white text-[10px]">
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Nama Operator:</span>
              <strong className="text-slate-900">{report.operatorName}</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Shift Kerja:</span>
              <strong className="text-slate-900">{report.shift}</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Hari & Tanggal:</span>
              <strong className="text-slate-900">{report.dayAndDate}</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Jam Kerja:</span>
              <strong className="text-slate-900">{report.workStartTime} - {report.workEndTime}</strong>
            </div>
          </div>

          {/* Project & SASA Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-x-2 divide-y-2 sm:divide-y-0 divide-slate-900 border-t-2 border-slate-900 bg-slate-50 text-[10px]">
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Nama Project:</span>
              <strong className="text-slate-900">{report.project}</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Sosa No. (No. SPK / Order):</span>
              <strong className="font-mono text-slate-900">{report.sasaNo}</strong>
            </div>
          </div>
        </div>

        {/* 2. Bagian A: Perawatan Mesin */}
        <div className="border border-slate-900 mb-3">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900 flex justify-between">
            <span>BAGIAN A: PERAWATAN MESIN (MAINTENANCE)</span>
            <span className="font-mono text-[9px]">Pelumasan & Pisau</span>
          </div>
          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
            <div>
              <table className="w-full border-collapse border border-slate-900 text-[9px]">
                <tbody>
                  <tr className="border-b border-slate-900">
                    <td className="p-1 bg-slate-100 font-semibold w-1/2">Pengisian Oli Pelumas</td>
                    <td className="p-1 font-bold">{report.sectionA.oilFillVolumeMl || 0} mL</td>
                  </tr>
                  <tr>
                    <td className="p-1 bg-slate-100 font-semibold">Level / Ketinggian Oli</td>
                    <td className="p-1 font-bold text-emerald-700">{report.sectionA.oilLevel || 'Normal'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <table className="w-full border-collapse border border-slate-900 text-[9px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900">
                    <th className="p-1 text-left">Mata Pisau</th>
                    <th className="p-1 text-center">Ganti?</th>
                    <th className="p-1 text-center">Tanggal</th>
                    <th className="p-1 text-left">Kondisi Tool</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  <tr>
                    <td className="p-1 font-semibold">Pisau V-Cut</td>
                    <td className="p-1 text-center font-bold">{report.sectionA.bladeChanges.vcut.replaced ? 'Ya' : 'Tidak'}</td>
                    <td className="p-1 text-center font-mono">{report.sectionA.bladeChanges.vcut.changeDate || '-'}</td>
                    <td className="p-1 text-[8px] text-slate-600">{report.sectionA.bladeChanges.vcut.toolCondition || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-semibold">End Mill 3mm</td>
                    <td className="p-1 text-center font-bold">{report.sectionA.bladeChanges.endmill3mm.replaced ? 'Ya' : 'Tidak'}</td>
                    <td className="p-1 text-center font-mono">{report.sectionA.bladeChanges.endmill3mm.changeDate || '-'}</td>
                    <td className="p-1 text-[8px] text-slate-600">{report.sectionA.bladeChanges.endmill3mm.toolCondition || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-semibold">End Mill 6mm</td>
                    <td className="p-1 text-center font-bold">{report.sectionA.bladeChanges.endmill6mm.replaced ? 'Ya' : 'Tidak'}</td>
                    <td className="p-1 text-center font-mono">{report.sectionA.bladeChanges.endmill6mm.changeDate || '-'}</td>
                    <td className="p-1 text-[8px] text-slate-600">{report.sectionA.bladeChanges.endmill6mm.toolCondition || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Bagian B: CNC Quick (Putih) */}
        <div className="border border-slate-900 mb-3">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900 flex justify-between">
            <span>BAGIAN B: MESIN CNC ROUTER QUICK (PUTIH)</span>
            <span className="font-semibold text-[9px]">Total Komponen: {totalQuickComps} pcs</span>
          </div>
          <table className="w-full border-collapse border border-slate-900 text-[9px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                <th className="border border-slate-900 p-1 w-6">No</th>
                <th className="border border-slate-900 p-1 text-left">Nama Part / Komponen</th>
                <th className="border border-slate-900 p-1 text-left">Material</th>
                <th className="border border-slate-900 p-1 w-12">Proses (m)</th>
                <th className="border border-slate-900 p-1 w-12">Delay (m)</th>
                <th className="border border-slate-900 p-1 text-left">Keterangan Delay</th>
                <th className="border border-slate-900 p-1 w-12">Hasil (pcs)</th>
                <th className="border border-slate-900 p-1 w-12">Potong</th>
                <th className="border border-slate-900 p-1 w-10">QC</th>
              </tr>
            </thead>
            <tbody>
              {report.sectionB_Quick.map((row) => (
                <tr key={row.sheetNumber} className="border-b border-slate-300">
                  <td className="border border-slate-900 p-1 text-center font-bold bg-slate-50">{row.sheetNumber}</td>
                  <td className="border border-slate-900 p-1 font-medium">{row.productName || '-'}</td>
                  <td className="border border-slate-900 p-1 text-slate-600">{row.materialType || '-'}</td>
                  <td className="border border-slate-900 p-1 text-center font-mono">{row.processTime || '-'}</td>
                  <td className="border border-slate-900 p-1 text-center font-mono text-amber-700">{row.delayTime || '-'}</td>
                  <td className="border border-slate-900 p-1 text-slate-600 text-[8px]">{row.delayReason || '-'}</td>
                  <td className="border border-slate-900 p-1 text-right font-mono font-bold">{row.totalComponents || '-'}</td>
                  <td className="border border-slate-900 p-1 text-center">{row.cutType}</td>
                  <td className="border border-slate-900 p-1 text-center font-bold">
                    <span className={row.quality === 'OK' ? 'text-emerald-700' : 'text-red-700'}>{row.quality}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Bagian C: CNC Tekma (Biru) */}
        <div className="border border-slate-900 mb-3">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900 flex justify-between">
            <span>BAGIAN C: MESIN CNC ROUTER TEKMA (BIRU)</span>
            <span className="font-semibold text-[9px]">Total Komponen: {totalTekmaComps} pcs</span>
          </div>
          <table className="w-full border-collapse border border-slate-900 text-[9px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                <th className="border border-slate-900 p-1 w-6">No</th>
                <th className="border border-slate-900 p-1 text-left">Nama Part / Komponen</th>
                <th className="border border-slate-900 p-1 text-left">Material</th>
                <th className="border border-slate-900 p-1 w-12">Proses (m)</th>
                <th className="border border-slate-900 p-1 w-12">Delay (m)</th>
                <th className="border border-slate-900 p-1 text-left">Keterangan Delay</th>
                <th className="border border-slate-900 p-1 w-12">Hasil (pcs)</th>
                <th className="border border-slate-900 p-1 w-12">Potong</th>
                <th className="border border-slate-900 p-1 w-10">QC</th>
              </tr>
            </thead>
            <tbody>
              {report.sectionC_Tekma.map((row) => (
                <tr key={row.sheetNumber} className="border-b border-slate-300">
                  <td className="border border-slate-900 p-1 text-center font-bold bg-slate-50">{row.sheetNumber}</td>
                  <td className="border border-slate-900 p-1 font-medium">{row.productName || '-'}</td>
                  <td className="border border-slate-900 p-1 text-slate-600">{row.materialType || '-'}</td>
                  <td className="border border-slate-900 p-1 text-center font-mono">{row.processTime || '-'}</td>
                  <td className="border border-slate-900 p-1 text-center font-mono text-amber-700">{row.delayTime || '-'}</td>
                  <td className="border border-slate-900 p-1 text-slate-600 text-[8px]">{row.delayReason || '-'}</td>
                  <td className="border border-slate-900 p-1 text-right font-mono font-bold">{row.totalComponents || '-'}</td>
                  <td className="border border-slate-900 p-1 text-center">{row.cutType}</td>
                  <td className="border border-slate-900 p-1 text-center font-bold">
                    <span className={row.quality === 'OK' ? 'text-emerald-700' : 'text-red-700'}>{row.quality}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Bagian D & E: Material & Dimensi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Bagian D */}
          <div className="border border-slate-900">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900">
              BAGIAN D: PEMAKAIAN MATERIAL PP FLUTE
            </div>
            <table className="w-full border-collapse border border-slate-900 text-[9px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900 text-left font-bold">
                  <th className="border border-slate-900 p-1">Ketebalan</th>
                  <th className="border border-slate-900 p-1 text-center">Pemakaian (Lbr)</th>
                  <th className="border border-slate-900 p-1 text-center">Sisa Afval</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="border border-slate-900 p-1 font-semibold">PP Flute Board G4 mm</td>
                  <td className="border border-slate-900 p-1 text-center font-bold">{report.sectionD.ppG4mm?.lembar || 0}</td>
                  <td className="border border-slate-900 p-1 text-center">{report.sectionD.ppG4mm?.sisa || '-'}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="border border-slate-900 p-1 font-semibold">PP Flute Board 8 mm</td>
                  <td className="border border-slate-900 p-1 text-center font-bold">{report.sectionD.pp8mm?.lembar || 0}</td>
                  <td className="border border-slate-900 p-1 text-center">{report.sectionD.pp8mm?.sisa || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-900 p-1 font-semibold">PP Flute Board F10 mm</td>
                  <td className="border border-slate-900 p-1 text-center font-bold">{report.sectionD.ppF10mm?.lembar || 0}</td>
                  <td className="border border-slate-900 p-1 text-center">{report.sectionD.ppF10mm?.sisa || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bagian E */}
          <div className="border border-slate-900">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900">
              BAGIAN E: PENGECEKAN DIMENSI & TOLERANSI
            </div>
            <table className="w-full border-collapse border border-slate-900 text-[9px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                  <th className="border border-slate-900 p-1 w-6">S#</th>
                  <th className="border border-slate-900 p-1">P (mm)</th>
                  <th className="border border-slate-900 p-1">L (mm)</th>
                  <th className="border border-slate-900 p-1">T (mm)</th>
                  <th className="border border-slate-900 p-1 text-left">Toleransi / Status</th>
                </tr>
              </thead>
              <tbody>
                {report.sectionE.map((dim) => (
                  <tr key={dim.sheetNumber} className="border-b border-slate-300">
                    <td className="border border-slate-900 p-1 text-center font-bold bg-slate-50">{dim.sheetNumber}</td>
                    <td className="border border-slate-900 p-1 text-center font-mono">{dim.lengthMm || '-'}</td>
                    <td className="border border-slate-900 p-1 text-center font-mono">{dim.widthMm || '-'}</td>
                    <td className="border border-slate-900 p-1 text-center font-mono">{dim.thicknessMm || '-'}</td>
                    <td className="border border-slate-900 p-1 text-[8px] text-slate-600">{dim.toleranceNotes || 'OK'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Bagian F: Catatan & Kendala */}
        <div className="border border-slate-900 mb-4 text-[9px]">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900">
            BAGIAN F: CATATAN TAMBAHAN, PESAN SHIFT & KENDALA
          </div>
          <div className="p-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <strong className="block text-slate-700">Pekerjaan Lain:</strong>
              <div className="border border-slate-300 p-1.5 min-h-[38px] bg-slate-50">
                {report.sectionF.otherWork || '-'}
              </div>
            </div>
            <div>
              <strong className="block text-slate-700">Pesan / Info Shift:</strong>
              <div className="border border-slate-300 p-1.5 min-h-[38px] bg-slate-50">
                {report.sectionF.messageOrInfo || '-'}
              </div>
            </div>
            <div>
              <strong className="block text-slate-700 text-red-800">Kendala / Masalah:</strong>
              <div className="border border-slate-300 p-1.5 min-h-[38px] bg-amber-50/50">
                {report.sectionF.issues || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* 7. KOTAK TANDA TANGAN & PENGESAHAN (SIGNATURE BLOCK) */}
        <div className="border-2 border-slate-900">
          <div className="bg-slate-900 text-white px-2 py-1 font-bold text-[10px] uppercase text-center tracking-wider">
            LEMBAR PENGESAHAN & PERSETUJUAN BERTINGKAT (OFFICIAL WORKFLOW)
          </div>

          <div className="grid grid-cols-3 divide-x-2 divide-slate-900 text-center">
            {/* Operator */}
            <div className="p-2 flex flex-col justify-between h-36">
              <div>
                <span className="font-bold uppercase text-[9px] text-slate-600 block">Diajukan Oleh:</span>
                <span className="font-bold text-[10px]">OPERATOR CNC</span>
              </div>

              {/* Digital Checkmark */}
              <div className="my-auto py-1">
                <div className="inline-flex flex-col items-center justify-center p-1.5 border border-blue-400 bg-blue-50 rounded">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mb-0.5" />
                  <span className="text-[8px] font-bold text-blue-900 leading-none">DIGITALLY SUBMITTED</span>
                  <span className="text-[7px] text-slate-500 font-mono mt-0.5">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-400 pt-1">
                <div className="font-bold text-[10px]">{report.operatorName}</div>
                <div className="text-[8px] text-slate-500">Operator Mesin CNC</div>
              </div>
            </div>

            {/* Supervisor */}
            <div className="p-2 flex flex-col justify-between h-36 bg-slate-50/60">
              <div>
                <span className="font-bold uppercase text-[9px] text-slate-600 block">Diperiksa & Diverifikasi:</span>
                <span className="font-bold text-[10px]">SUPERVISOR</span>
              </div>

              {/* SPV Signature Stamp */}
              <div className="my-auto py-1">
                {report.supervisorApproval?.decision === 'APPROVED' ? (
                  <div className="inline-flex flex-col items-center justify-center p-1.5 border-2 border-emerald-600 bg-emerald-50 rounded-lg">
                    <UserCheck className="w-5 h-5 text-emerald-600 mb-0.5" />
                    <span className="text-[8px] font-black text-emerald-800 leading-none">VERIFIED & APPROVED</span>
                    <span className="text-[7px] text-emerald-700 font-mono mt-0.5">
                      {report.supervisorApproval.approvedAt ? new Date(report.supervisorApproval.approvedAt).toLocaleString('id-ID') : '-'}
                    </span>
                    <span className="text-[7px] text-slate-600 max-w-[120px] truncate italic mt-0.5">
                      "{report.supervisorApproval.notes}"
                    </span>
                  </div>
                ) : (
                  <div className="border border-dashed border-amber-400 p-2 rounded bg-amber-50/40 text-[8px] text-amber-800">
                    <span className="font-bold block">MENUNGGU REVIEW SPV</span>
                    <span className="text-[7px]">Verifikasi lembar kerja & pisau</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-400 pt-1">
                <div className="font-bold text-[10px]">{report.supervisorName}</div>
                <div className="text-[8px] text-slate-500">Supervisor Produksi</div>
              </div>
            </div>

            {/* General Manager */}
            <div className="p-2 flex flex-col justify-between h-36 bg-slate-50/60">
              <div>
                <span className="font-bold uppercase text-[9px] text-slate-600 block">Disahkan Final Oleh:</span>
                <span className="font-bold text-[10px]">GENERAL MANAGER</span>
              </div>

              {/* GM Signature Stamp */}
              <div className="my-auto py-1">
                {report.status === 'APPROVED' && report.gmApproval?.decision === 'APPROVED' ? (
                  <div className="inline-flex flex-col items-center justify-center p-1.5 border-2 border-purple-700 bg-purple-50 rounded-lg shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-purple-700 mb-0.5" />
                    <span className="text-[8px] font-black text-purple-900 leading-none">FINAL GM APPROVAL</span>
                    <span className="text-[7px] text-purple-800 font-mono mt-0.5">
                      {report.gmApproval.approvedAt ? new Date(report.gmApproval.approvedAt).toLocaleString('id-ID') : '-'}
                    </span>
                    <span className="text-[7px] text-slate-600 max-w-[120px] truncate italic mt-0.5">
                      "{report.gmApproval.notes}"
                    </span>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-400 p-2 rounded bg-slate-100 text-[8px] text-slate-500">
                    <span className="font-bold block">MENUNGGU PENGESAHAN GM</span>
                    <span className="text-[7px]">Tahap akhir pengesahan pabrik</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-400 pt-1">
                <div className="font-bold text-[10px]">{report.gmName}</div>
                <div className="text-[8px] text-slate-500">General Manager</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Dokumen */}
        <div className="mt-3 flex justify-between items-center text-[8px] text-slate-500 border-t border-slate-300 pt-1">
          <span>Dicetak melalui Sistem Informasi Manufaktur CNC PT Labtech Indonesia</span>
          <span>Security Token: {report.supervisorToken ? report.supervisorToken.substring(0, 10) : 'LAB'}... | {report.id}</span>
        </div>
      </div>
    </div>
  );
};
