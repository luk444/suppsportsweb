import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

app.post('/create-preference', async (req, res) => {
  try {
    const { items, payer } = req.body;

    console.log('📦 Items received:', items);
    console.log('👤 Payer received:', payer);

    // Validate items
    const validItems = items.every(
      item =>
        item &&
        typeof item.title === 'string' &&
        typeof item.unit_price === 'number' &&
        typeof item.quantity === 'number'
    );

    if (!validItems) {
      return res.status(400).json({ error: 'Invalid items format' });
    }

    // Validate email
    if (!payer?.email || typeof payer.email !== 'string') {
      return res.status(400).json({ error: 'Invalid payer email' });
    }

    const preference = await new Preference(client).create({
      body: {
        items,
        payer: {
          email: payer.email,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/order-confirmation`,
          failure: `${process.env.FRONTEND_URL}/checkout`,
          pending: `${process.env.FRONTEND_URL}/checkout`,
        },
        auto_return: 'approved',
      }
    });

    res.json({ id: preference.id });
  } catch (error) {
    console.error('❌ Error creating preference:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});