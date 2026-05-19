export type AiUnavailableResult = {
  ok: false;
  message: string;
};

function unavailable(sourceText: string): AiUnavailableResult {
  if (!sourceText.trim()) {
    return {
      ok: false,
      message: "Добавьте исходный текст выпуска, чтобы включить AI-функции.",
    };
  }

  return {
    ok: false,
    message: "AI-модуль подготовлен как optional layer и не включён в MVP.",
  };
}

export async function generatePodcastSummary(sourceText: string) {
  return unavailable(sourceText);
}

export async function extractInsights(sourceText: string) {
  return unavailable(sourceText);
}

export async function extractActionItems(sourceText: string) {
  return unavailable(sourceText);
}

export async function generateTags(
  _title: string,
  _description: string,
  sourceText: string,
) {
  return unavailable(sourceText);
}
