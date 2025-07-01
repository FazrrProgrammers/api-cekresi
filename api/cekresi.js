const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const { resi } = req.query;
  if (!resi) return res.status(400).json({ error: "Masukkan resi!" });

  try {
    const { data: html } = await axios.get(`https://jtexpress.my.id/cek-resi/${resi}`);
    const $ = cheerio.load(html);

    const hasil = $(".tracking .list-group-item")
      .map((_, el) => {
        const waktu = $(el).find("small").text().trim();
        const status = $(el).find(".mb-1").text().trim();
        return { waktu, status };
      })
      .get();

    if (!hasil.length) return res.status(404).json({ error: "Resi tidak ditemukan" });

    return res.status(200).json({
      resi,
      hasil
    });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ error: "Gagal ambil data resi." });
  }
};
