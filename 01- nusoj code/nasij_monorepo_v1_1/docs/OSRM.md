# OSRM Region Setup

- Set `OSRM_PBF_URL` in `.env` to your region extract (default: Saudi Arabia).
- Restart `osrm` service to fetch/prepare the dataset.
- Route API (after up): `http://localhost:5000/route/v1/driving/{lon},{lat};{lon},{lat}`
- Table API: `http://localhost:5000/table/v1/driving/{lon},{lat};{lon},{lat}`
