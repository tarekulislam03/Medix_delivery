import express from 'express';

const router = express.Router();

/**
 * GET /api/location/reverse
 * Query params: lat, lng
 * Returns human-readable address from coordinates
 */
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    let addressData = {
      shortAddress: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      fullAddress: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      city: 'Siliguri',
      coordinates: { lat: latitude, lng: longitude },
    };

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'MedixDeliveryApp/1.0 (medix.support@gmail.com)',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(3500),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};

        const area =
          addr.suburb ||
          addr.neighbourhood ||
          addr.road ||
          addr.commercial ||
          addr.residential ||
          addr.county ||
          '';

        const city = addr.city || addr.town || addr.village || 'Siliguri';
        const postcode = addr.postcode ? ` - ${addr.postcode}` : '';

        const short = area ? `${area}, ${city}` : city;
        const full = data.display_name || `${short}${postcode}`;

        addressData = {
          shortAddress: short,
          fullAddress: full,
          city: city,
          coordinates: { lat: latitude, lng: longitude },
        };
      }
    } catch (fetchErr) {
      console.warn('Reverse geocoding fetch failed, using coordinate fallback:', fetchErr.message);
    }

    return res.status(200).json(addressData);
  } catch (error) {
    console.error('Error in reverse geocoding route:', error);
    return res.status(500).json({ error: 'Failed to reverse geocode' });
  }
});

export default router;
