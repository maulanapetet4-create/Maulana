import { CncDailyReport } from '../types';

const escapeCsvCell = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Generates and downloads a summary CSV file containing 1 row per report
 */
export const exportReportsToCsvSummary = (reports: CncDailyReport[]): void => {
  const headers = [
    'ID Laporan',
    'Tanggal Laporan',
    'No. SPK (Sosa No)',
    'Project',
    'Nama Operator',
    'Shift',
    'Jam Mulai',
    'Jam Selesai',
    'Status Approval',
    'Volume Oli (mL)',
    'Level Oli',
    'Pisau Vcut Diganti',
    'Tgl Ganti Vcut',
    'Pisau EndMill 3mm Diganti',
    'Tgl Ganti 3mm',
    'Pisau EndMill 6mm Diganti',
    'Tgl Ganti 6mm',
    'Total Komponen Quick (pcs)',
    'Waktu Proses Quick (m)',
    'Total Komponen Tekma (pcs)',
    'Waktu Proses Tekma (m)',
    'Total Komponen Semua (pcs)',
    'PP G4mm (Lembar)',
    'PP G4mm (Sisa)',
    'PP 8mm (Lembar)',
    'PP 8mm (Sisa)',
    'PP F10mm (Lembar)',
    'PP F10mm (Sisa)',
    'Catatan Pekerjaan Lain',
    'Pesan Informasi',
    'Kendala / Masalah',
    'Supervisor (SPV)',
    'Status SPV',
    'Catatan SPV',
    'Waktu SPV',
    'General Manager (GM)',
    'Status GM',
    'Catatan GM',
    'Waktu GM',
  ];

  const rows = reports.map((r) => {
    const quickComps = r.sectionB_Quick.reduce(
      (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0),
      0
    );
    const quickTime = r.sectionB_Quick.reduce(
      (a, b) => a + (typeof b.processTime === 'number' ? b.processTime : 0),
      0
    );
    const tekmaComps = r.sectionC_Tekma.reduce(
      (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0),
      0
    );
    const tekmaTime = r.sectionC_Tekma.reduce(
      (a, b) => a + (typeof b.processTime === 'number' ? b.processTime : 0),
      0
    );

    return [
      escapeCsvCell(r.id),
      escapeCsvCell(r.dayAndDate),
      escapeCsvCell(r.sasaNo),
      escapeCsvCell(r.project),
      escapeCsvCell(r.operatorName),
      escapeCsvCell(r.shift),
      escapeCsvCell(r.workStartTime),
      escapeCsvCell(r.workEndTime),
      escapeCsvCell(r.status),
      escapeCsvCell(r.sectionA.oilFillVolumeMl || 0),
      escapeCsvCell(r.sectionA.oilLevel),
      escapeCsvCell(r.sectionA.bladeChanges.vcut.replaced ? 'Ya' : 'Tidak'),
      escapeCsvCell(r.sectionA.bladeChanges.vcut.changeDate || '-'),
      escapeCsvCell(r.sectionA.bladeChanges.endmill3mm.replaced ? 'Ya' : 'Tidak'),
      escapeCsvCell(r.sectionA.bladeChanges.endmill3mm.changeDate || '-'),
      escapeCsvCell(r.sectionA.bladeChanges.endmill6mm.replaced ? 'Ya' : 'Tidak'),
      escapeCsvCell(r.sectionA.bladeChanges.endmill6mm.changeDate || '-'),
      escapeCsvCell(quickComps),
      escapeCsvCell(quickTime),
      escapeCsvCell(tekmaComps),
      escapeCsvCell(tekmaTime),
      escapeCsvCell(quickComps + tekmaComps),
      escapeCsvCell(r.sectionD.ppG4mm?.lembar || 0),
      escapeCsvCell(r.sectionD.ppG4mm?.sisa || '-'),
      escapeCsvCell(r.sectionD.pp8mm?.lembar || 0),
      escapeCsvCell(r.sectionD.pp8mm?.sisa || '-'),
      escapeCsvCell(r.sectionD.ppF10mm?.lembar || 0),
      escapeCsvCell(r.sectionD.ppF10mm?.sisa || '-'),
      escapeCsvCell(r.sectionF.otherWork || '-'),
      escapeCsvCell(r.sectionF.messageOrInfo || '-'),
      escapeCsvCell(r.sectionF.issues || '-'),
      escapeCsvCell(r.supervisorName),
      escapeCsvCell(r.supervisorApproval?.decision || 'PENDING'),
      escapeCsvCell(r.supervisorApproval?.notes || '-'),
      escapeCsvCell(r.supervisorApproval?.approvedAt || '-'),
      escapeCsvCell(r.gmName),
      escapeCsvCell(r.gmApproval?.decision || 'PENDING'),
      escapeCsvCell(r.gmApproval?.notes || '-'),
      escapeCsvCell(r.gmApproval?.approvedAt || '-'),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  downloadCsvFile(csvContent, `Laporan_Harian_CNC_Ringkasan_${getTimestampSlug()}.csv`);
};

/**
 * Export single report to full detailed Excel/CSV
 */
export const exportSingleReportToCsv = (report: CncDailyReport): void => {
  exportReportsToCsvDetailed([report]);
};

/**
 * Generates and downloads a detailed CSV with one row per sheet (Sheet 1 - 6 for Quick and Tekma)
 */
export const exportReportsToCsvDetailed = (reports: CncDailyReport[]): void => {
  const headers = [
    'ID Laporan',
    'Tanggal Laporan',
    'No. SPK (Sosa No)',
    'Project',
    'Nama Operator',
    'Shift',
    'Status Approval',
    'Mesin CNC',
    'Sheet Ke-',
    'Nama Produk / Part',
    'Jenis Material',
    'Waktu Proses (menit)',
    'Setup (menit)',
    'Inspeksi (menit)',
    'Delay (menit)',
    'Alasan Delay',
    'Total Komponen (pcs)',
    'Jenis Potongan',
    'Kualitas',
    'Dimensi Panjang (mm)',
    'Dimensi Lebar (mm)',
    'Dimensi Tebal (mm)',
    'Toleransi',
  ];

  const rows: string[] = [];

  reports.forEach((r) => {
    // Process Quick sheets (1 to 6)
    r.sectionB_Quick.forEach((sheet) => {
      const dim = r.sectionE.find((d) => d.sheetNumber === sheet.sheetNumber);
      rows.push([
        escapeCsvCell(r.id),
        escapeCsvCell(r.dayAndDate),
        escapeCsvCell(r.sasaNo),
        escapeCsvCell(r.project),
        escapeCsvCell(r.operatorName),
        escapeCsvCell(r.shift),
        escapeCsvCell(r.status),
        escapeCsvCell('CNC Quick (Putih)'),
        escapeCsvCell(sheet.sheetNumber),
        escapeCsvCell(sheet.productName || '-'),
        escapeCsvCell(sheet.materialType || '-'),
        escapeCsvCell(sheet.processTime || 0),
        escapeCsvCell(sheet.setupTime || 0),
        escapeCsvCell(sheet.inspectionTime || 0),
        escapeCsvCell(sheet.delayTime || 0),
        escapeCsvCell(sheet.delayReason || '-'),
        escapeCsvCell(sheet.totalComponents || 0),
        escapeCsvCell(sheet.cutType),
        escapeCsvCell(sheet.quality),
        escapeCsvCell(dim?.lengthMm || '-'),
        escapeCsvCell(dim?.widthMm || '-'),
        escapeCsvCell(dim?.thicknessMm || '-'),
        escapeCsvCell(dim?.toleranceNotes || '-'),
      ].join(','));
    });

    // Process Tekma sheets (1 to 6)
    r.sectionC_Tekma.forEach((sheet) => {
      const dim = r.sectionE.find((d) => d.sheetNumber === sheet.sheetNumber);
      rows.push([
        escapeCsvCell(r.id),
        escapeCsvCell(r.dayAndDate),
        escapeCsvCell(r.sasaNo),
        escapeCsvCell(r.project),
        escapeCsvCell(r.operatorName),
        escapeCsvCell(r.shift),
        escapeCsvCell(r.status),
        escapeCsvCell('CNC Tekma (Biru)'),
        escapeCsvCell(sheet.sheetNumber),
        escapeCsvCell(sheet.productName || '-'),
        escapeCsvCell(sheet.materialType || '-'),
        escapeCsvCell(sheet.processTime || 0),
        escapeCsvCell(sheet.setupTime || 0),
        escapeCsvCell(sheet.inspectionTime || 0),
        escapeCsvCell(sheet.delayTime || 0),
        escapeCsvCell(sheet.delayReason || '-'),
        escapeCsvCell(sheet.totalComponents || 0),
        escapeCsvCell(sheet.cutType),
        escapeCsvCell(sheet.quality),
        escapeCsvCell(dim?.lengthMm || '-'),
        escapeCsvCell(dim?.widthMm || '-'),
        escapeCsvCell(dim?.thicknessMm || '-'),
        escapeCsvCell(dim?.toleranceNotes || '-'),
      ].join(','));
    });
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const fileName = reports.length === 1 
    ? `Laporan_CNC_${reports[0].id}_${(reports[0].sasaNo || 'SPK').replace(/\s+/g, '_')}_${getTimestampSlug()}.csv`
    : `Laporan_Harian_CNC_Detail_Sheet_${getTimestampSlug()}.csv`;
  downloadCsvFile(csvContent, fileName);
};

const downloadCsvFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getTimestampSlug = (): string => {
  const now = new Date();
  return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
};
