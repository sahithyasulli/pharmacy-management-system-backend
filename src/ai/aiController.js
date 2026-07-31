const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const recommendMedicine = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a pharmacy assistant. Recommend common over-the-counter medicines based on symptoms. Always include a disclaimer that users should consult a doctor before taking any medicine.",
        },
        {
          role: "user",
          content: `Symptoms: ${symptoms}`,
        },
      ],
    });

    res.status(200).json({
      success: true,
      symptoms,
      recommendation: completion.choices[0].message.content,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  recommendMedicine,
};