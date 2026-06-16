export default async function jishoHandler(req, res){
    const { keyword } = req.query;
    if (!keyword){
        return res.status(400).json({ error: 'Keyword query parameter is required' });
    }

    try {
        const jishoUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`;
        const response = await fetch(jishoUrl);

        if (!response.ok){
            return res.status(500).json({ error: 'Failed to fetch data from Jisho' });
        }

        const data = await response.json();

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'An error occurred while fetching data from Jisho' });
    }
}
