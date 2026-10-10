// Email akun UAT untuk tiap persona pada user switcher.
// Password TIDAK disimpan di sini: diambil server-side dari env
// SIGNIT_UAT_PASSWORD oleh loginPersonaAction dan tidak pernah dikirim ke browser.
export const PERSONA_EMAILS: Record<string, string> = {
  pengaju: "uat.pengaju-himpunan@demo.signit.example",
  ketupel: "uat.ketupel@demo.signit.example",
  "ketua-himpunan": "uat.ketua@demo.signit.example",
  pembina: "uat.pembina@demo.signit.example",
  kemahasiswaan: "uat.kemahasiswaan@demo.signit.example",
  dagri: "uat.dagri@demo.signit.example",
  baak: "uat.baak@demo.signit.example",
  wadir3: "uat.wadir3@demo.signit.example",
};
