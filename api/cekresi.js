const puppeteer = require("puppeteer");

module.exports = async (req, res) => {
  const { resi, hp } = req.query;
  if (!resi || !hp) return res.status(400).json({ error: "Masukkan resi & 4 digit no HP" });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1");

    await page.goto("https://jet.co.id/track", { waitUntil: "networkidle2" });

    await page.type('input[name="awb"]', resi);
    await page.click('button[type="submit"]');
    await page.waitForSelector('input[name="otp"]', { timeout: 5000 });
    await page.type('input[name="otp"]', hp);
    await page.click('button[type="submit"]');

    await page.waitForSelector(".tracking-detail", { timeout: 10000 });

    const data = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".tracking-detail .item"));
      return items.map(el => ({
        waktu: el.querySelector(".date").innerText.trim(),
        status: el.querySelector(".status").innerText.trim()
      }));
    });

    await browser.close();
    return res.json({ resi, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Gagal ambil data resi." });
  }
};
