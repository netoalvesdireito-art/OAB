import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";

const DEMO_QUESTIONS = [
  {
    id: "demo-40-1",
    exame: "40\u00ba Exame",
    tipoProva: "Tipo 1 - Branca",
    numeroQuestao: 1,
    disciplina: "Etica",
    assunto: "Etica Profissional",
    dificuldade: "Media",
    enunciado: "Determinada sociedade de advogados deseja se associar a advogados que nao a integram para prestacao de servicos e participacao nos resultados. Segundo a legislacao aplicavel a formalizacao desse vinculo juridico, assinale a opcao correta.",
    alternativas: [
      "O contrato de associacao nao pode ser pactuado em carater geral.",
      "O contrato de associacao devera ser registrado no Conselho Seccional da OAB em cuja base territorial tiver sede a sociedade de advogados.",
      "O contrato de associacao podera atribuir a totalidade dos riscos exclusivamente ao advogado associado.",
      "O advogado nao pode celebrar contrato de associacao com mais de uma sociedade de advogados."
    ],
    correta: 1,
    explicacao: "Gabarito: alternativa B.",
    baseLegal: "Questao demonstrativa do 40o Exame.",
    origem: "Demonstracao"
  }
];

const DEMO_GABARITOS = {
  "40\u00ba Exame::Tipo 1 - Branca": { 1: 1 }
};

const DISCIPLINAS_BASE = [
  "Etica",
  "Constitucional",
  "Administrativo",
  "Civil",
  "Processo Civil",
  "Penal",
  "Processo Penal",
  "Trabalho",
  "Processo do Trabalho",
  "Tributario",
  "Empresarial",
  "Direitos Humanos",
  "Ambiental",
  "Internacional",
  "ECA",
  "Filosofia do Direito",
  "Consumidor",
  "Previdenciario"
];

const SESSION_SIZES = [5, 10, 20, 40, 80, 100, 200, 400];

const state = {
  screen: "dashboard",
  questionBank: [...DEMO_QUESTIONS],
  gabaritosMap: { ...DEMO_GABARITOS },
  importLogs: [],
  isImporting: false,
  disciplinaFiltro: "Todas",
  quantidade: "10",
  simulado: [],
  current: 0,
  answers: {},
  revealedAnswers: {},
  marked: {},
  secondsLeft: 0,
  startedAt: null,
  finishedAt: null,
  history: [],
  search: "",
  examFilter: "Todos",
  instantFeedback: true,
  showFilesPanel: true,
  libraryIndex: 0,
  libraryAnswers: {},
  libraryRevealed: {},
  librarySessionSize: "10",
  navSessionSize: "10",
  librarySession: [],
  librarySessionIndex: 0,
  timerId: null
};

const app = document.getElementById("app");

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const min = Math.floor(safe / 60).toString().padStart(2, "0");
  const sec = (safe % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const GARBLED_PDF_CHAR_MAP = {
  "\u0003": " ",
  "\u0005": "A",
  "\u0011": "B",
  "\u0012": "C",
  "\u0018": "D",
  ";": "(",
  "": "A",
  "": "B",
  "": "C",
  "": "D",
  Ă: "a",
  ă: "a",
  Ą: "a",
  ď: "b",
  Đ: "c",
  Ě: "d",
  Ę: "e",
  ę: "e",
  Ě: "d",
  Ĝ: "g",
  Ğ: "e",
  ğ: "g",
  Ġ: "e",
  Ģ: "g",
  Ĩ: "f",
  ĩ: "i",
  Ī: "i",
  Ĭ: "i",
  ĭ: "i",
  Į: "i",
  İ: "i",
  ı: "i",
  Ĵ: "j",
  ĵ: "j",
  Ő: "g",
  ơ: "o",
  Ţ: "t",
  ƀ: "b",
  Ɓ: "B",
  Ƃ: "B",
  Ɖ: "p",
  Ɗ: "D",
  Ƌ: "q",
  ƌ: "r",
  Ɛ: "s",
  Ƒ: "F",
  ƒ: "f",
  Ɠ: "G",
  Ɨ: "I",
  Ƙ: "K",
  ƚ: "t",
  ƛ: "l",
  Ɯ: "M",
  Ɲ: "N",
  ƞ: "n",
  Ɵ: "o",
  Ơ: "O",
  Ƣ: "OI",
  ƣ: "oi",
  Ƥ: "P",
  ƥ: "p",
  Ʀ: "YR",
  Ƨ: "S",
  ƨ: "s",
  Ʃ: "E",
  ƪ: "sh",
  ƫ: "t",
  Ƭ: "T",
  ƭ: "t",
  Ʈ: "2",
  Ư: "U",
  ư: "u",
  Ʊ: "Y",
  Ʋ: "V",
  Ƴ: "Y",
  ƴ: "y",
  Ƶ: "u",
  ƶ: "z",
  Ʒ: "3",
  Ƹ: "E",
  ƹ: "e",
  ƺ: "z",
  ǀ: "v",
  ǁ: "w",
  ǂ: "ll",
  ǆ: "x",
  Ǉ: "Y",
  ǈ: "Lj",
  ǉ: "lj",
  Ǌ: "Nj",
  ǋ: "nj",
  ǌ: "z",
  Ǎ: "A",
  ǎ: "a",
  Ǐ: "I",
  ǐ: "i",
  Ǒ: "O",
  ǒ: "o",
  Ǔ: "U",
  ǔ: "u",
  Ǟ: "A",
  ǟ: "a",
  Ǥ: "G",
  ǥ: "g",
  Ǧ: "G",
  ǧ: "g",
  Ǫ: "O",
  ǫ: "o",
  Ǭ: "O",
  ǭ: "o",
  ǰ: "j",
  "Ͳ": "-",
  "ͳ": "-",
  "ʹ": "-",
  "͵": "'",
  ";": ";",
  "Ϳ": ")"
};

function decodeGarbledPdfLine(line) {
  const text = String(line || "");
  const weirdCount = (text.match(/[\u0000-\u001f\u0100-\u024f\u0370-\u03ff]/g) || []).length;
  if (weirdCount < 3) return text;
  return [...text].map((char) => GARBLED_PDF_CHAR_MAP[char] ?? char).join("");
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ϬΟО]/g, "0")
    .replace(/ϭ/g, "1")
    .replace(/Ϯ/g, "2")
    .replace(/ϯ/g, "3")
    .replace(/ϰ/g, "4")
    .replace(/[ϱϵ]/g, "5")
    .replace(/ϲ/g, "6")
    .replace(/ϳ/g, "7")
    .replace(/ϴ/g, "8")
    .replace(/Ϲ/g, "9")
    .split("\n")
    .map((line) => decodeGarbledPdfLine(line))
    .join("\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/[\u00A0\u2007\u202F]/g, " ")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeQuestionMarkers(text) {
  return String(text || "")
    .replace(/\bQUEST[AÃƒ]O\s+(\d{1,2})/gi, "\n$1 ")
    .replace(/(^|[\n\r])\s*(\d{1,2})\s*[º°o]?\s*QUEST[AÃƒ]O/gi, "$1$2 ")
    .replace(/(^|[\n\r])\s*(\d{1,2})\s*[-–—]\s*/g, "$1$2 ")
    .replace(/(^|[\n\r\s])([ABCD])\s*[\.\-:]/g, "$1$2)")
    .replace(/(^|[\n\r\s])([ABCD])\s+\)/g, "$1$2)")
    .replace(/(^|[\n\r])\s*([ABCD])\s+/g, "$1$2) ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function stripPdfNoise(text) {
  return String(text || "")
    .replace(/FGV PROJETOS[\s\S]*?ORDEM DOS ADVOGADOS DO BRASIL/gi, " ")
    .replace(/XLI{0,3}\s+EXAME[\s\S]*?UNIFICADO/gi, " ")
    .replace(/PROVA PRATICO-PROFISSIONAL/gi, " ")
    .replace(/P[ÃA]GINA\s+\d+/gi, " ")
    .replace(/\bTIPO\s+\d\b/gi, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function inferExamFromText(text, fallbackName = "") {
  const joined = `${fallbackName} ${text}`;
  const match = joined.match(/(40|41|42|43|44|45)\s*[\u00BAo]?\s*EXAME/i) || joined.match(/(40|41|42|43|44|45)O EXAME/i);
  if (!match) return "Exame importado";
  return `${match[1]}\u00ba Exame`;
}

function inferTipoFromText(text, fallbackName = "") {
  const joined = `${fallbackName} ${text}`.toUpperCase();
  if (joined.includes("TIPO 1") || joined.includes("TIPO 1 - BRANCA") || joined.includes("BRANCA")) return "Tipo 1 - Branca";
  if (joined.includes("TIPO 2") || joined.includes("VERDE")) return "Tipo 2 - Verde";
  if (joined.includes("TIPO 3") || joined.includes("AMARELA") || joined.includes("AMARELO")) return "Tipo 3 - Amarela";
  if (joined.includes("TIPO 4") || joined.includes("AZUL")) return "Tipo 4 - Azul";
  return "Tipo nao identificado";
}

function inferDisciplina(questionNumber, enunciado) {
  const n = Number(questionNumber);
  const text = String(enunciado || "").toLowerCase();
  if (n >= 1 && n <= 8) return "Etica";
  if (text.includes("kelsen") || text.includes("kant") || text.includes("filosofia")) return "Filosofia do Direito";
  if (text.includes("constituicao") || text.includes("republica") || text.includes("supremo tribunal federal") || text.includes("adi") || text.includes("adpf")) return "Constitucional";
  if (text.includes("administracao") || text.includes("ato administrativo") || text.includes("licitacao") || text.includes("servidor")) return "Administrativo";
  if (text.includes("mandato") || text.includes("negocio juridico") || text.includes("posse") || text.includes("contrato")) return "Civil";
  if (text.includes("cpc") || text.includes("contestacao") || text.includes("competencia") || text.includes("cumprimento de sentenca")) return "Processo Civil";
  if (text.includes("lei penal") || text.includes("crime") || text.includes("pena") || text.includes("culpabilidade")) return "Penal";
  if (text.includes("acao penal") || text.includes("inquerito") || text.includes("prisao") || text.includes("processo penal")) return "Processo Penal";
  if (text.includes("clt") || text.includes("empregado") || text.includes("jornada") || text.includes("salario")) return "Trabalho";
  if (text.includes("recurso ordinario") || text.includes("audiencia trabalhista") || text.includes("processo do trabalho")) return "Processo do Trabalho";
  if (text.includes("tributo") || text.includes("imposto") || text.includes("iof") || text.includes("anterioridade")) return "Tributario";
  if (text.includes("sociedade limitada") || text.includes("falencia") || text.includes("empresario")) return "Empresarial";
  if (text.includes("direitos humanos") || text.includes("convencao americana") || text.includes("pacto de san jose")) return "Direitos Humanos";
  if (text.includes("dano ambiental") || text.includes("meio ambiente")) return "Ambiental";
  if (text.includes("nacionalidade") || text.includes("tratado") || text.includes("direito internacional")) return "Internacional";
  if (text.includes("crianca") || text.includes("adolescente") || text.includes("eca")) return "ECA";
  if (text.includes("consumidor") || text.includes("cdc") || text.includes("produto")) return "Consumidor";
  if (text.includes("seguridade") || text.includes("previdencia") || text.includes("beneficio previdenciario")) return "Previdenciario";
  return "Geral";
}

async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  function buildLines(items) {
    const lines = [];
    for (const item of items) {
      const lastLine = lines[lines.length - 1];
      if (!lastLine || Math.abs(lastLine.y - item.y) > 2) {
        lines.push({ y: item.y, parts: [item] });
      } else {
        lastLine.parts.push(item);
      }
    }

    return lines
      .map((line) => ({
        y: line.y,
        text: line.parts
          .sort((a, b) => a.x - b.x)
          .map((part) => part.str)
          .join(" ")
          .replace(/ +/g, " ")
          .trim()
      }))
      .filter((line) => line.text);
  }

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    const items = content.items
      .filter((item) => item.str && item.str.trim())
      .map((item) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5]
      }))
      .sort((a, b) => {
        const yDiff = Math.abs(b.y - a.y);
        if (yDiff > 2) return b.y - a.y;
        return a.x - b.x;
      });

    const topThreshold = items.length ? Math.max(...items.map((item) => item.y)) - 28 : 0;
    const separatorX = viewport.width * 0.5;
    const topItems = items.filter((item) => item.y >= topThreshold);
    const bodyItems = items.filter((item) => item.y < topThreshold);
    const leftItems = bodyItems.filter((item) => item.x < separatorX);
    const rightItems = bodyItems.filter((item) => item.x >= separatorX);
    const hasTwoColumns = leftItems.length >= 30 && rightItems.length >= 30;

    const orderedLines = hasTwoColumns
      ? [
          ...buildLines(topItems),
          ...buildLines(leftItems),
          ...buildLines(rightItems)
        ]
      : buildLines(items);

    const text = orderedLines
      .map((line) => line.text)
      .filter(Boolean)
      .join("\n");

    pages.push(normalizeText(text));
  }
  return pages;
}

function extractAlternatives(block) {
  const normalizedBlock = normalizeQuestionMarkers(block);
  const patterns = ["A)", "B)", "C)", "D)"];
  const positions = patterns.map((label) => normalizedBlock.indexOf(label));
  if (positions.some((pos) => pos === -1)) return null;

  const alternatives = [];
  for (let i = 0; i < patterns.length; i += 1) {
    const start = positions[i] + patterns[i].length;
    const end = i < patterns.length - 1 ? positions[i + 1] : block.length;
    const text = normalizedBlock.slice(start, end).replace(/\s+/g, " ").trim();
    if (!text) return null;
    alternatives.push(text);
  }

  return {
    enunciado: normalizedBlock.slice(0, positions[0]).replace(/\s+/g, " ").trim(),
    alternativas: alternatives
  };
}

function detectQuestionStartNumber(line, nextLine = "") {
  const trimmed = String(line || "").trim();
  const nextTrimmed = String(nextLine || "").trim();
  if (!trimmed) return null;
  if (/\bEXAME\b/i.test(trimmed) || /\bORDEM\b/i.test(trimmed) || /\bUNIFICADO\b/i.test(trimmed) || /\bP[ÁA]GINA\b/i.test(trimmed) || /\bTIPO\b/i.test(trimmed)) {
    return null;
  }

  const patterns = [
    /^QUEST[AÃƒ]O\s*(\d{1,2})\b/i,
    /^(\d{1,2})\s*[º°o]?\s*QUEST[AÃƒ]O\b/i,
    /^(\d{1,2})\s*[.-]\s*(?=[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ(])/,
    /^(\d{1,2})\s+(?=[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ(])/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return Number(match[1]);
  }

  const standaloneNumber = trimmed.match(/^(\d{1,2})$/);
  if (standaloneNumber && /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ"“(]/.test(nextTrimmed)) {
    return Number(standaloneNumber[1]);
  }

  return null;
}

function stripLeadingQuestionMarker(line, questionNumber) {
  return String(line || "")
    .replace(new RegExp(`^\\s*QUEST[AÃƒ]O\\s*${questionNumber}\\b\\s*`, "i"), "")
    .replace(new RegExp(`^\\s*${questionNumber}\\s*[º°o]?\\s*QUEST[AÃƒ]O\\b\\s*`, "i"), "")
    .replace(new RegExp(`^\\s*${questionNumber}\\s*[.-]\\s*`), "")
    .replace(new RegExp(`^\\s*${questionNumber}\\s+`), "")
    .trim();
}

function updateAlternativeProgress(progress, line) {
  let nextProgress = progress;
  const normalizedLine = normalizeQuestionMarkers(line);
  if (nextProgress < 1 && /A\)/.test(normalizedLine)) nextProgress = 1;
  if (nextProgress < 2 && /B\)/.test(normalizedLine)) nextProgress = 2;
  if (nextProgress < 3 && /C\)/.test(normalizedLine)) nextProgress = 3;
  if (nextProgress < 4 && /D\)/.test(normalizedLine)) nextProgress = 4;
  return nextProgress;
}

function splitQuestionBlocks(text) {
  const cleaned = normalizeQuestionMarkers(stripPdfNoise(text));
  const lines = cleaned.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const blocks = [];
  let current = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1] || "";
    const detectedNumber = detectQuestionStartNumber(line, nextLine);
    const currentLooksComplete = current ? current.alternativeProgress === 4 : false;
    const lineIsStandaloneNumber = /^\d{1,2}$/.test(line);
    const shouldStartNewBlock = detectedNumber
      && detectedNumber >= 1
      && detectedNumber <= 80
      && (
        !current
        || (lineIsStandaloneNumber && currentLooksComplete)
        || detectedNumber === current.numeroQuestao + 1
        || (detectedNumber > current.numeroQuestao && currentLooksComplete)
      );

    if (shouldStartNewBlock) {
      if (current) {
        const body = current.lines.join("\n").trim();
        if (body && current.alternativeProgress === 4) {
          blocks.push({
            numeroQuestao: current.numeroQuestao,
            body
          });
        }
      }

      current = {
        numeroQuestao: detectedNumber,
        lines: [],
        alternativeProgress: 0
      };

      const firstLine = stripLeadingQuestionMarker(line, detectedNumber);
      if (firstLine) {
        current.lines.push(firstLine);
        current.alternativeProgress = updateAlternativeProgress(current.alternativeProgress, firstLine);
      }
      continue;
    }

    if (current) {
      current.lines.push(line);
      current.alternativeProgress = updateAlternativeProgress(current.alternativeProgress, line);
    }
  }

  if (current) {
    const body = current.lines.join("\n").trim();
    if (body && current.alternativeProgress === 4) {
      blocks.push({
        numeroQuestao: current.numeroQuestao,
        body
      });
    }
  }

  return blocks;
}

function splitPagesIntoSections(pages, fileName = "") {
  const sections = [];
  let current = null;

  for (const page of pages) {
    const normalizedPage = normalizeText(page);
    const exam = inferExamFromText(normalizedPage, fileName);
    const tipoProva = inferTipoFromText(normalizedPage, fileName);
    const hasExamMarker = /(40|41|42|43|44|45)\s*[\u00BAo]?\s*EXAME/i.test(normalizedPage) || /(40|41|42|43|44|45)O EXAME/i.test(normalizedPage);
    const hasTipoMarker = /\bTIPO\s*[1-4]\b/i.test(normalizedPage) || /\b(BRANCA|VERDE|AMARELA|AZUL)\b/i.test(normalizedPage);
    const startsNewSection = current && (hasExamMarker || hasTipoMarker) && (exam !== current.exam || tipoProva !== current.tipoProva);

    if (!current || startsNewSection) {
      if (current) sections.push(current);
      current = {
        exam,
        tipoProva,
        pages: [normalizedPage]
      };
      continue;
    }

    current.pages.push(normalizedPage);
  }

  if (current) sections.push(current);
  return sections;
}

function parseQuestionsFromPages(pages, fileName = "") {
  const parsed = [];
  const sections = splitPagesIntoSections(pages, fileName);

  for (const section of sections) {
    const joined = normalizeQuestionMarkers(stripPdfNoise(normalizeText(section.pages.join("\n\n"))));
    const exam = section.exam || inferExamFromText(joined, fileName);
    const tipoProva = section.tipoProva || inferTipoFromText(joined, fileName);
    const blocks = splitQuestionBlocks(joined);

    for (const block of blocks) {
      if (block.numeroQuestao < 1 || block.numeroQuestao > 80) continue;
      const extracted = extractAlternatives(block.body);
      if (!extracted) continue;

      const disciplina = inferDisciplina(block.numeroQuestao, extracted.enunciado);
      parsed.push({
        id: `${exam.replace(/\s+/g, "-")}-${tipoProva.replace(/\s+/g, "-")}-${block.numeroQuestao}`,
        exame: exam,
        tipoProva,
        numeroQuestao: block.numeroQuestao,
        disciplina,
        assunto: disciplina,
        dificuldade: "Media",
        enunciado: extracted.enunciado,
        alternativas: extracted.alternativas,
        correta: null,
        explicacao: "Gabarito importado automaticamente quando disponivel.",
        baseLegal: `Questao importada do arquivo ${fileName}.`,
        origem: fileName || "PDF importado"
      });
    }
  }

  return parsed.reduce((acc, item) => {
    if (!acc.some((existing) => existing.id === item.id)) acc.push(item);
    return acc;
  }, []);
}

function parseGabaritosFromText(text) {
  const normalized = normalizeText(text).toUpperCase();
  const exams = ["40", "41", "42", "43", "44", "45"];
  const tipoLabels = [
    { label: "Tipo 1 - Branca", key: 1 },
    { label: "Tipo 2 - Verde", key: 2 },
    { label: "Tipo 3 - Amarela", key: 3 },
    { label: "Tipo 4 - Azul", key: 4 }
  ];
  const result = {};

  for (const exam of exams) {
    for (const tipo of tipoLabels) {
      const blockRegex = new RegExp(`${exam}[\\u00BAO]?\\s*EXAME[\\s\\S]{0,200}?TIPO\\s*${tipo.key}[\\s\\S]{0,2500}`, "i");
      const blockMatch = normalized.match(blockRegex);
      if (!blockMatch) continue;
      const pairs = [...blockMatch[0].matchAll(/(\d{1,2})\s*[-.:]?\s*([ABCD])/g)];
      const examName = `${exam}\u00ba Exame`;
      const mapKey = `${examName}::${tipo.label}`;
      result[mapKey] = {};
      if (pairs.length >= 40) {
        pairs.forEach(([, questionNumber, letter]) => {
          const number = Number(questionNumber);
          if (number >= 1 && number <= 80) {
            result[mapKey][number] = { A: 0, B: 1, C: 2, D: 3 }[letter];
          }
        });
      } else {
        const letters = blockMatch[0].match(/[ABCD]/g);
        if (!letters || letters.length < 40) {
          delete result[mapKey];
          continue;
        }
        letters.slice(0, 80).forEach((letter, idx) => {
          result[mapKey][idx + 1] = { A: 0, B: 1, C: 2, D: 3 }[letter];
        });
      }
    }
  }

  return result;
}

function mergeQuestionsWithGabaritos(questions, gabaritosMap) {
  return questions.map((q) => {
    const key = `${q.exame}::${q.tipoProva}`;
    const correta = gabaritosMap[key]?.[q.numeroQuestao];
    return {
      ...q,
      correta: Number.isInteger(correta) ? correta : 0,
      explicacao: Number.isInteger(correta)
        ? `Gabarito importado automaticamente: alternativa ${String.fromCharCode(65 + correta)}.`
        : "Gabarito nao localizado automaticamente. Ajuste manualmente se necessario."
    };
  });
}

function addLog(message) {
  state.importLogs = [message, ...state.importLogs].slice(0, 20);
}

function getDisciplinas() {
  return ["Todas", ...new Set([...DISCIPLINAS_BASE, ...state.questionBank.map((q) => q.disciplina).filter(Boolean)])];
}

function getExams() {
  return ["Todos", ...new Set(state.questionBank.map((q) => q.exame).filter(Boolean))];
}

function getFilteredBank() {
  return state.questionBank.filter((q) => {
    const okDisciplina = state.disciplinaFiltro === "Todas" || q.disciplina === state.disciplinaFiltro;
    const okExam = state.examFilter === "Todos" || q.exame === state.examFilter;
    const okSearch = !state.search || [q.disciplina, q.assunto, q.enunciado, q.origem || "", q.exame || ""].join(" ").toLowerCase().includes(state.search.toLowerCase());
    return okDisciplina && okExam && okSearch;
  });
}

function getStats() {
  const totalRespondidas = state.history.reduce((acc, h) => acc + h.total, 0);
  const totalAcertos = state.history.reduce((acc, h) => acc + h.correct, 0);
  const allAnswered = state.history.flatMap((h) => h.questions.map((q) => ({ ...q, userAnswer: h.answers[q.id] })));
  const byDisciplineMap = new Map();

  allAnswered.forEach((q) => {
    const prev = byDisciplineMap.get(q.disciplina) || { name: q.disciplina, total: 0, correct: 0 };
    prev.total += 1;
    if (q.userAnswer === q.correta) prev.correct += 1;
    byDisciplineMap.set(q.disciplina, prev);
  });

  const byDiscipline = Array.from(byDisciplineMap.values()).map((d) => ({
    ...d,
    accuracy: d.total ? Math.round((d.correct / d.total) * 100) : 0
  }));

  return {
    totalRespondidas,
    totalAcertos,
    overallAccuracy: totalRespondidas ? Math.round((totalAcertos / totalRespondidas) * 100) : 0,
    byDiscipline
  };
}

function buildStudyPlan(stats) {
  const weak = [...stats.byDiscipline].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  if (!weak.length) return [];
  return weak.map((item, idx) => ({
    prioridade: idx + 1,
    disciplina: item.name,
    meta: item.accuracy < 50 ? "Revisar teoria + 20 questoes" : "Fazer 15 questoes e revisar erros",
    foco: item.accuracy < 50 ? "Base conceitual" : "Consolidacao e velocidade"
  }));
}

function getOptionState(question, optionIndex, answers, revealedAnswers) {
  const wasAnswered = answers[question.id] !== undefined;
  const isSelected = answers[question.id] === optionIndex;
  const isCorrect = question.correta === optionIndex;
  const isRevealed = Boolean(revealedAnswers[question.id]);
  if (!wasAnswered) return "idle";
  if (!isRevealed) return isSelected ? "selected" : "idle";
  if (isCorrect) return "correct";
  if (isSelected && !isCorrect) return "wrong";
  return "idle";
}

function resetLibraryView() {
  state.libraryIndex = 0;
  state.librarySession = [];
  state.librarySessionIndex = 0;
}

function setScreen(screen) {
  state.screen = screen;
  render();
}

function startTimer() {
  stopTimer();
  state.timerId = window.setInterval(() => {
    if (state.screen !== "exam") {
      stopTimer();
      return;
    }
    if (state.secondsLeft <= 1) {
      state.secondsLeft = 0;
      stopTimer();
      finishExam();
      return;
    }
    state.secondsLeft -= 1;
    render();
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startExam() {
  const filteredBank = getFilteredBank();
  const count = Math.max(1, Math.min(Number(state.quantidade) || 10, filteredBank.length || 1));
  state.simulado = [...filteredBank].slice(0, count);
  state.current = 0;
  state.answers = {};
  state.revealedAnswers = {};
  state.marked = {};
  state.startedAt = Date.now();
  state.finishedAt = null;
  state.secondsLeft = count * 90;
  state.screen = "exam";
  startTimer();
  render();
}

function finishExam() {
  const ended = Date.now();
  state.finishedAt = ended;
  stopTimer();
  const total = state.simulado.length;
  const correct = state.simulado.filter((q) => state.answers[q.id] === q.correta).length;
  state.history = [{
    id: String(ended),
    date: new Date(ended).toLocaleString("pt-BR"),
    total,
    correct,
    answers: { ...state.answers },
    questions: [...state.simulado],
    durationSec: state.startedAt ? Math.round((ended - state.startedAt) / 1000) : 0
  }, ...state.history];
  state.screen = "results";
  render();
}

function selectExamAnswer(questionId, index) {
  const question = state.simulado.find((item) => item.id === questionId);
  if (!question || state.revealedAnswers[question.id]) return;
  state.answers = { ...state.answers, [question.id]: index };
  if (state.instantFeedback) {
    state.revealedAnswers = { ...state.revealedAnswers, [question.id]: true };
  }
  render();
}

function selectLibraryAnswer(questionId, index) {
  const question = state.questionBank.find((item) => item.id === questionId);
  if (!question || state.libraryRevealed[question.id]) return;
  state.libraryAnswers = { ...state.libraryAnswers, [question.id]: index };
  state.libraryRevealed = { ...state.libraryRevealed, [question.id]: true };
  render();
}

function startLibrarySession() {
  const filteredBank = getFilteredBank();
  const count = Math.max(1, Math.min(Number(state.librarySessionSize) || 10, filteredBank.length || 1));
  state.librarySession = [...filteredBank].slice(0, count);
  state.librarySessionIndex = 0;
  state.libraryAnswers = {};
  state.libraryRevealed = {};
  render();
}

function applyNavSessionSize() {
  const filteredBank = getFilteredBank();
  const count = Math.max(1, Math.min(Number(state.navSessionSize) || 10, filteredBank.length || 1));
  state.librarySession = [...filteredBank].slice(0, count);
  state.librarySessionIndex = 0;
  render();
}

function clearLibrarySession() {
  state.librarySession = [];
  state.librarySessionIndex = 0;
  state.libraryAnswers = {};
  state.libraryRevealed = {};
  render();
}

function clearImportedData() {
  stopTimer();
  state.questionBank = [...DEMO_QUESTIONS];
  state.gabaritosMap = { ...DEMO_GABARITOS };
  state.importLogs = [];
  state.libraryAnswers = {};
  state.libraryRevealed = {};
  state.history = [];
  state.simulado = [];
  state.answers = {};
  state.revealedAnswers = {};
  state.marked = {};
  state.secondsLeft = 0;
  state.startedAt = null;
  state.finishedAt = null;
  resetLibraryView();
  render();
}

async function handleQuestionPdfImport(files) {
  if (!files.length) return;
  state.isImporting = true;
  addLog(`Iniciando importacao de ${files.length} PDF(s) de prova.`);
  render();
  try {
    const imported = [];
    for (const file of files) {
      addLog(`Lendo ${file.name}...`);
      render();
      const pages = await extractTextFromPdf(file);
      const parsed = parseQuestionsFromPages(pages, file.name);
      addLog(`${file.name}: ${parsed.length} questao(oes) identificada(s).`);
      imported.push(...parsed);
      render();
    }
    const merged = [...state.questionBank, ...imported].reduce((acc, item) => {
      acc.set(item.id, item);
      return acc;
    }, new Map());
    state.questionBank = mergeQuestionsWithGabaritos(Array.from(merged.values()), state.gabaritosMap);
    if (imported.length === 0) {
      addLog("Nenhuma questao nova foi reconhecida. Verifique se o PDF esta em formato de prova objetiva e tente outro arquivo.");
    }
    addLog(`Importacao concluida. Banco com ${imported.length} nova(s) questao(oes).`);
    state.disciplinaFiltro = "Todas";
    state.examFilter = "Todos";
    state.search = "";
    resetLibraryView();
  } catch (error) {
    addLog(`Falha na importacao das provas: ${error.message}`);
  } finally {
    state.isImporting = false;
    render();
  }
}

async function handleGabaritoPdfImport(files) {
  if (!files.length) return;
  state.isImporting = true;
  addLog(`Iniciando importacao de ${files.length} PDF(s) de gabarito.`);
  render();
  try {
    let mergedMap = { ...state.gabaritosMap };
    for (const file of files) {
      addLog(`Lendo ${file.name}...`);
      render();
      const pages = await extractTextFromPdf(file);
      const parsedMap = parseGabaritosFromText(pages.join("\n\n"));
      mergedMap = { ...mergedMap, ...parsedMap };
      addLog(`${file.name}: ${Object.keys(parsedMap).length} bloco(s) de gabarito identificado(s).`);
      render();
    }
    state.gabaritosMap = mergedMap;
    state.questionBank = mergeQuestionsWithGabaritos(state.questionBank, mergedMap);
    addLog("Gabaritos importados e vinculados ao banco.");
  } catch (error) {
    addLog(`Falha na importacao dos gabaritos: ${error.message}`);
  } finally {
    state.isImporting = false;
    render();
  }
}

function renderSelectOptions(options, selected) {
  return options.map((option) => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
}

function renderQuestionPlayer(question, answers, revealedMap, onSelectType, navigationLabel, instantFeedback) {
  if (!question) {
    return `<div class="empty-state">Nenhuma questao disponivel para os filtros selecionados.</div>`;
  }

  const answered = answers[question.id] !== undefined;
  const revealed = Boolean(revealedMap[question.id]);
  const feedbackVisible = answered && (instantFeedback || revealed);
  const hit = answers[question.id] === question.correta;

  return `
    <div class="list-stack">
      <div class="chip-list">
        <span class="chip">${escapeHtml(question.disciplina)}</span>
        <span class="chip">${escapeHtml(question.assunto)}</span>
        <span class="chip outline">${escapeHtml(question.dificuldade)}</span>
        ${question.exame ? `<span class="chip">${escapeHtml(question.exame)}</span>` : ""}
        ${question.numeroQuestao ? `<span class="chip outline">Questao ${escapeHtml(question.numeroQuestao)}</span>` : ""}
        ${navigationLabel ? `<span class="chip outline">${escapeHtml(navigationLabel)}</span>` : ""}
      </div>
      <div>
        <p class="question-text">${escapeHtml(question.enunciado)}</p>
        ${question.tipoProva ? `<p class="question-meta">${escapeHtml(question.tipoProva)}</p>` : ""}
      </div>
      <div class="option-list">
        ${question.alternativas.map((alt, index) => {
          const stateClass = getOptionState(question, index, answers, revealedMap);
          return `
            <button class="option-button ${stateClass}" data-action="${onSelectType}" data-question-id="${escapeHtml(question.id)}" data-option-index="${index}" ${revealed ? "disabled" : ""}>
              <strong>${String.fromCharCode(65 + index)})</strong> ${escapeHtml(alt)}
            </button>
          `;
        }).join("")}
      </div>
      ${feedbackVisible ? `
        <div class="feedback-box ${hit ? "correct" : "wrong"}">
          <div><strong>${hit ? "Resposta correta" : "Resposta incorreta"}</strong></div>
          <div><strong>Gabarito:</strong> ${String.fromCharCode(65 + (question.correta ?? 0))}) ${escapeHtml(question.alternativas[question.correta ?? 0])}</div>
          <div><strong>Comentario:</strong> ${escapeHtml(question.explicacao)}</div>
          <div class="small"><strong>Referencia:</strong> ${escapeHtml(question.baseLegal)}</div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderDashboard(filteredBank, stats, studyPlan, exams) {
  return `
    <div class="grid">
      <div class="grid dashboard-grid">
        <div class="stat-card"><div class="stat-label">Precisao geral</div><div class="stat-value">${stats.overallAccuracy}%</div></div>
        <div class="stat-card"><div class="stat-label">Questoes no banco</div><div class="stat-value">${state.questionBank.length}</div></div>
        <div class="stat-card"><div class="stat-label">Questoes respondidas</div><div class="stat-value">${stats.totalRespondidas}</div></div>
        <div class="stat-card"><div class="stat-label">Simulados feitos</div><div class="stat-value">${state.history.length}</div></div>
      </div>

      <div class="grid two-column">
        <section class="card">
          <h2>Desempenho por disciplina</h2>
          <div class="list-stack" style="margin-top:16px;">
            ${stats.byDiscipline.length === 0 ? `<div class="alert">Importe os PDFs e realize simulados para gerar diagnostico.</div>` : [...stats.byDiscipline].sort((a, b) => b.accuracy - a.accuracy).map((item) => `
              <div class="study-item">
                <div class="row spread"><strong>${escapeHtml(item.name)}</strong><span>${item.correct}/${item.total} acertos - ${item.accuracy}%</span></div>
                <div class="progress-bar" style="margin-top:12px;"><span style="width:${item.accuracy}%"></span></div>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="card">
          <h2>Plano automatico</h2>
          <div class="list-stack" style="margin-top:16px;">
            ${studyPlan.length === 0 ? `<p class="muted">O plano aparecera apos os primeiros resultados.</p>` : studyPlan.map((item) => `
              <div class="study-item">
                <div class="row spread"><strong>${escapeHtml(item.disciplina)}</strong><span class="chip">Prioridade ${item.prioridade}</span></div>
                <p>${escapeHtml(item.meta)}</p>
                <p class="muted small">Foco: ${escapeHtml(item.foco)}</p>
              </div>
            `).join("")}
          </div>
        </section>
      </div>

      ${state.showFilesPanel ? `
        <section class="card">
          <div class="row spread">
            <h2>Status do acervo</h2>
            <button class="secondary-button" data-action="go-screen" data-screen="import">Ir para importacao</button>
          </div>
          <div class="grid three-column" style="margin-top:16px;">
            <div class="exam-item"><strong>Exames detectados</strong><div class="stat-value">${exams.length - 1}</div></div>
            <div class="exam-item"><strong>Questoes importadas</strong><div class="stat-value">${state.questionBank.length}</div></div>
            <div class="exam-item"><strong>Blocos de gabarito</strong><div class="stat-value">${Object.keys(state.gabaritosMap).length}</div></div>
          </div>
        </section>
      ` : ""}
    </div>
  `;
}

function renderImport() {
  return `
    <div class="grid two-column">
      <section class="card">
        <h2>Importacao automatica de PDFs</h2>
        <div class="alert" style="margin-top:16px;">
          Importe primeiro os PDFs das provas e, em seguida, o PDF de gabaritos. O sistema tenta extrair automaticamente exame, tipo de prova, numero da questao, alternativas e resposta correta.
        </div>
        <div class="grid" style="grid-template-columns:1fr 1fr; margin-top:16px;">
          <div class="upload-box">
            <h3>PDFs das provas</h3>
            <p class="muted">Selecione os arquivos 40, 41, 42, 43, 44 e 45.</p>
            <label class="upload-label ${state.isImporting ? "disabled" : ""}">
              Selecionar arquivos
              <input id="questionPdfInput" type="file" accept="application/pdf" multiple ${state.isImporting ? "disabled" : ""}>
            </label>
          </div>
          <div class="upload-box">
            <h3>PDF de gabaritos</h3>
            <p class="muted">Selecione o arquivo consolidado de gabaritos.</p>
            <label class="upload-label ${state.isImporting ? "disabled" : ""}">
              Selecionar arquivo
              <input id="gabaritoPdfInput" type="file" accept="application/pdf" multiple ${state.isImporting ? "disabled" : ""}>
            </label>
          </div>
        </div>
        <div class="chip-list" style="margin-top:16px;">
          <button class="ghost-button" data-action="clear-imported">Limpar banco</button>
          <span class="chip">Banco atual: ${state.questionBank.length} questao(oes)</span>
          <span class="chip outline">Gabaritos: ${Object.keys(state.gabaritosMap).length} bloco(s)</span>
        </div>
      </section>

      <section class="card">
        <h2>Log de importacao</h2>
        <div class="list-stack" style="margin-top:16px;">
          ${state.isImporting ? `<div class="alert success">Processando arquivos...</div>` : ""}
          ${state.importLogs.length === 0 ? `<p class="muted">Nenhum log ainda.</p>` : `<div class="log-list">${state.importLogs.map((log) => `<div class="log-item">${escapeHtml(log)}</div>`).join("")}</div>`}
        </div>
      </section>
    </div>
  `;
}

function renderBuilder(filteredBank, disciplinas, exams) {
  const estimado = Math.max(1, Math.min(Number(state.quantidade) || 10, filteredBank.length || 1)) * 90;
  return `
    <div class="grid two-column">
      <section class="card">
        <h2>Montar simulado</h2>
        <div class="grid three-column" style="margin-top:18px;">
          <div class="input-group">
            <label for="disciplinaFiltro">Disciplina</label>
            <select id="disciplinaFiltro" class="select" data-action="set-disciplina">
              ${renderSelectOptions(disciplinas, state.disciplinaFiltro)}
            </select>
          </div>
          <div class="input-group">
            <label for="examFilter">Exame</label>
            <select id="examFilter" class="select" data-action="set-exam-filter">
              ${renderSelectOptions(exams, state.examFilter)}
            </select>
          </div>
          <div class="input-group">
            <label for="quantidade">Quantidade de questoes</label>
            <input id="quantidade" class="input" value="${escapeHtml(state.quantidade)}" data-action="set-quantidade">
          </div>
        </div>
        <div class="grid" style="grid-template-columns:1fr 1fr; margin-top:18px;">
          <label class="toggle">
            <span>
              <strong>Correcao imediata</strong>
              <div class="muted small">Ao marcar uma alternativa, o sistema informa se esta certa ou errada.</div>
            </span>
            <input id="instantFeedback" type="checkbox" ${state.instantFeedback ? "checked" : ""}>
          </label>
          <div class="toggle">
            <span>
              <strong>Painel de acervo</strong>
              <div class="muted small">Exibe o status do banco na tela inicial.</div>
            </span>
            <button class="secondary-button" data-action="toggle-files-panel">${state.showFilesPanel ? "Ocultar" : "Mostrar"}</button>
          </div>
        </div>
        <div class="study-item" style="margin-top:18px;">
          <strong>Previa</strong>
          <p class="muted">Questoes disponiveis com os filtros atuais: ${filteredBank.length}</p>
          <p class="muted">Tempo estimado: ${estimado} segundos</p>
          <p class="muted">Modo selecionado: ${state.instantFeedback ? "Treino com correcao instantanea" : "Prova com correcao apenas ao final"}</p>
        </div>
        <div style="margin-top:18px;">
          <button class="primary-button" data-action="start-exam" ${filteredBank.length === 0 ? "disabled" : ""}>Iniciar simulado</button>
        </div>
      </section>
      <section class="card">
        <h2>Recomendacoes</h2>
        <div class="list-stack" style="margin-top:16px;">
          <p>Importe primeiro provas e gabaritos.</p>
          <p>Depois filtre por disciplina ou exame e monte sessoes menores para estudo diario.</p>
          <p>Quando o parser captar as 400 questoes, o sistema passa a escalar sem edicao manual do codigo.</p>
        </div>
      </section>
    </div>
  `;
}

function renderLibrary(filteredBank, disciplinas, exams) {
  const effectiveLibraryQuestions = state.librarySession.length > 0 ? state.librarySession : filteredBank;
  const effectiveLibraryIndex = state.librarySession.length > 0 ? state.librarySessionIndex : state.libraryIndex;
  const effectiveLibraryQuestion = effectiveLibraryQuestions[effectiveLibraryIndex] || null;

  return `
    <div class="grid two-column" style="grid-template-columns:minmax(0, 3fr) minmax(300px, 1fr);">
      <section class="card">
        <h2>Banco de questoes</h2>
        <div class="grid three-column" style="margin-top:16px;">
          <input id="searchInput" class="search-input" placeholder="Buscar por disciplina, assunto, exame ou texto" value="${escapeHtml(state.search)}">
          <select id="libraryDisciplinaFiltro" class="select">${renderSelectOptions(disciplinas, state.disciplinaFiltro)}</select>
          <select id="libraryExamFilter" class="select">${renderSelectOptions(exams, state.examFilter)}</select>
        </div>
        <div class="study-item" style="margin-top:16px;">
          <strong>${filteredBank.length}</strong> questoes carregadas nos filtros atuais.
          <div class="muted small" style="margin-top:8px;">Voce pode responder todas as questoes disponiveis no filtro atual ou montar uma sessao com a quantidade desejada.</div>
        </div>
        <div class="grid three-column" style="margin-top:16px;">
          <div class="input-group">
            <label for="librarySessionSize">Quantidade para responder agora</label>
            <select id="librarySessionSize" class="select">
              ${SESSION_SIZES.map((size) => `<option value="${size}" ${String(size) === state.librarySessionSize ? "selected" : ""} ${size > filteredBank.length && filteredBank.length > 0 ? "disabled" : ""}>${size} questoes</option>`).join("")}
            </select>
          </div>
          <div class="row" style="align-items:end; grid-column: span 2;">
            <button class="primary-button" data-action="start-library-session" ${filteredBank.length === 0 ? "disabled" : ""}>Responder quantidade selecionada</button>
            <button class="ghost-button" data-action="clear-library-session">Ver pool completo do filtro</button>
          </div>
        </div>
        ${state.librarySession.length > 0 ? `<div class="alert" style="margin-top:16px;">Sessao ativa com <strong>${state.librarySession.length}</strong> questoes do filtro atual.</div>` : ""}
        <div style="margin-top:20px;">
          ${renderQuestionPlayer(effectiveLibraryQuestion, state.libraryAnswers, state.libraryRevealed, "answer-library", effectiveLibraryQuestion ? `${effectiveLibraryIndex + 1} de ${effectiveLibraryQuestions.length}` : "", true)}
        </div>
        ${effectiveLibraryQuestion ? `
          <div class="row" style="margin-top:16px;">
            <button class="ghost-button" data-action="library-prev" ${effectiveLibraryIndex === 0 ? "disabled" : ""}>Anterior</button>
            <button class="primary-button" data-action="library-next" ${effectiveLibraryIndex >= effectiveLibraryQuestions.length - 1 ? "disabled" : ""}>Proxima</button>
          </div>
        ` : ""}
      </section>

      <aside class="card">
        <h2>Navegacao</h2>
        <div class="input-group" style="margin-top:16px;">
          <label for="navSessionSize">Quantidade de questoes no painel</label>
          <select id="navSessionSize" class="select">
            ${SESSION_SIZES.map((size) => `<option value="${size}" ${String(size) === state.navSessionSize ? "selected" : ""} ${size > filteredBank.length && filteredBank.length > 0 ? "disabled" : ""}>${size} questoes</option>`).join("")}
          </select>
        </div>
        <div class="row" style="margin-top:14px;">
          <button class="secondary-button" data-action="apply-nav-size" ${filteredBank.length === 0 ? "disabled" : ""}>Aplicar no painel</button>
          <button class="ghost-button" data-action="clear-library-session">Mostrar todas</button>
        </div>
        <div class="nav-grid" style="margin-top:16px;">
          ${effectiveLibraryQuestions.map((q, idx) => {
            const answered = state.libraryAnswers[q.id] !== undefined;
            const correct = answered && state.libraryAnswers[q.id] === q.correta;
            const active = idx === effectiveLibraryIndex;
            const className = active ? "active" : answered ? (correct ? "correct" : "wrong") : "";
            return `<button class="question-nav-item ${className}" data-action="jump-library" data-index="${idx}">${escapeHtml(q.numeroQuestao || idx + 1)}</button>`;
          }).join("")}
        </div>
        <div class="list-stack small muted" style="margin-top:16px;">
          <div><strong>Respondidas:</strong> ${Object.keys(state.libraryAnswers).length}</div>
          <div><strong>Acertos:</strong> ${effectiveLibraryQuestions.filter((q) => state.libraryAnswers[q.id] === q.correta).length}</div>
          <div><strong>Questao atual:</strong> ${effectiveLibraryQuestion ? `${escapeHtml(effectiveLibraryQuestion.numeroQuestao)} - ${escapeHtml(effectiveLibraryQuestion.exame)}` : "-"}</div>
          <div><strong>Pool ativo:</strong> ${effectiveLibraryQuestions.length} questao(oes)</div>
        </div>
      </aside>
    </div>
  `;
}

function renderFiles(exams) {
  return `
    <section class="card">
      <h2>Acervo reconhecido pelo sistema</h2>
      <div class="grid three-column" style="margin-top:16px;">
        ${exams.slice(1).length === 0 ? `<div class="empty-state">Nenhum exame importado ainda.</div>` : exams.slice(1).map((exam) => `
          <div class="exam-item">
            <div class="row spread">
              <strong>${escapeHtml(exam)}</strong>
              <span class="chip">${state.questionBank.filter((q) => q.exame === exam).length} questoes</span>
            </div>
            <p class="muted small">Tipos detectados: ${escapeHtml(Array.from(new Set(state.questionBank.filter((q) => q.exame === exam).map((q) => q.tipoProva))).join(", ") || "-")}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderExam() {
  const currentQuestion = state.simulado[state.current];
  if (!currentQuestion) return `<div class="empty-state">Nenhum simulado ativo.</div>`;
  const progress = state.simulado.length ? Math.round(((state.current + 1) / state.simulado.length) * 100) : 0;
  const currentScore = state.simulado.filter((q) => state.answers[q.id] === q.correta).length;

  return `
    <div class="grid two-column" style="grid-template-columns:minmax(0, 3fr) minmax(300px, 1fr);">
      <section class="card">
        <div class="row spread">
          <div class="chip-list">
            <span class="chip">${escapeHtml(currentQuestion.disciplina)}</span>
            <span class="chip">${escapeHtml(currentQuestion.assunto)}</span>
            <span class="chip outline">${escapeHtml(currentQuestion.dificuldade)}</span>
          </div>
          <div><strong>Tempo:</strong> ${formatTime(state.secondsLeft)}</div>
        </div>
        <div style="margin-top:18px;">
          <div class="row spread small"><span>Questao ${state.current + 1} de ${state.simulado.length}</span><span>Parcial: ${currentScore} acertos</span></div>
          <div class="progress-bar" style="margin-top:8px;"><span style="width:${progress}%"></span></div>
        </div>
        <div style="margin-top:20px;">
          ${renderQuestionPlayer(currentQuestion, state.answers, state.revealedAnswers, "answer-exam", `${state.current + 1} de ${state.simulado.length}`, state.instantFeedback)}
        </div>
        <div class="row" style="margin-top:16px;">
          <button class="ghost-button" data-action="toggle-mark">Marcar para revisao</button>
          <button class="ghost-button" data-action="exam-prev" ${state.current === 0 ? "disabled" : ""}>Anterior</button>
          ${state.current < state.simulado.length - 1
            ? `<button class="primary-button" data-action="exam-next">Proxima</button>`
            : `<button class="primary-button" data-action="finish-exam">Finalizar simulado</button>`}
        </div>
      </section>

      <aside class="card">
        <h2>Navegacao</h2>
        <div class="nav-grid" style="margin-top:16px;">
          ${state.simulado.map((q, idx) => {
            const answered = state.answers[q.id] !== undefined;
            const isMarked = state.marked[q.id];
            const isCurrent = idx === state.current;
            const wasRevealed = state.revealedAnswers[q.id];
            const hit = state.answers[q.id] === q.correta;
            const className = isCurrent ? "active" : wasRevealed ? (hit ? "correct" : "wrong") : answered ? "answered" : "";
            return `<button class="question-nav-item ${className}" data-action="jump-exam" data-index="${idx}">${idx + 1}${isMarked ? "*" : ""}</button>`;
          }).join("")}
        </div>
        <div class="list-stack small muted" style="margin-top:16px;">
          <div><strong>Respondidas:</strong> ${Object.keys(state.answers).length}</div>
          <div><strong>Marcadas:</strong> ${Object.values(state.marked).filter(Boolean).length}</div>
          <div><strong>Restantes:</strong> ${state.simulado.length - Object.keys(state.answers).length}</div>
          <div><strong>Modo:</strong> ${state.instantFeedback ? "Correcao instantanea" : "Prova"}</div>
        </div>
      </aside>
    </div>
  `;
}

function renderResults() {
  const totalHits = state.simulado.filter((q) => state.answers[q.id] === q.correta).length;
  const accuracy = state.simulado.length ? Math.round((totalHits / state.simulado.length) * 100) : 0;
  return `
    <div class="grid">
      <div class="grid dashboard-grid">
        <div class="stat-card"><div class="stat-label">Acertos</div><div class="stat-value">${totalHits}/${state.simulado.length}</div></div>
        <div class="stat-card"><div class="stat-label">Precisao</div><div class="stat-value">${accuracy}%</div></div>
        <div class="stat-card"><div class="stat-label">Duracao</div><div class="stat-value">${formatTime(state.startedAt && state.finishedAt ? Math.round((state.finishedAt - state.startedAt) / 1000) : 0)}</div></div>
        <div class="stat-card"><div class="stat-label">Nao respondidas</div><div class="stat-value">${state.simulado.filter((q) => state.answers[q.id] === undefined).length}</div></div>
      </div>

      <section class="card">
        <h2>Correcao comentada</h2>
        <div class="list-stack" style="margin-top:16px;">
          ${state.simulado.map((q, idx) => {
            const hit = state.answers[q.id] === q.correta;
            return `
              <div class="result-card">
                <div class="row spread">
                  <strong>Questao ${idx + 1}</strong>
                  <span class="chip ${hit ? "success" : "danger"}">${hit ? "Acerto" : "Erro"}</span>
                </div>
                <p>${escapeHtml(q.enunciado)}</p>
                <p><strong>Sua resposta:</strong> ${state.answers[q.id] !== undefined ? `${String.fromCharCode(65 + state.answers[q.id])}) ${escapeHtml(q.alternativas[state.answers[q.id]])}` : "Nao respondida"}</p>
                <p><strong>Gabarito:</strong> ${String.fromCharCode(65 + q.correta)}) ${escapeHtml(q.alternativas[q.correta])}</p>
                <p class="muted"><strong>Comentario:</strong> ${escapeHtml(q.explicacao)}</p>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      <section class="card">
        <h2>Diagnostico</h2>
        <div class="list-stack" style="margin-top:16px;">
          <p>Seu desempenho neste simulado foi de <strong>${accuracy}%</strong>.</p>
          <div class="study-item">
            <strong>Proximas acoes sugeridas</strong>
            <ul>
              <li>Refazer apenas as questoes erradas em 24 horas.</li>
              <li>Revisar a base legal das disciplinas com menor precisao.</li>
              <li>Montar novo simulado por disciplina focando os pontos fracos.</li>
            </ul>
          </div>
          <div>
            <button class="primary-button" data-action="go-screen" data-screen="builder">Gerar novo simulado</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function render() {
  const filteredBank = getFilteredBank();
  const disciplinas = getDisciplinas();
  const exams = getExams();
  const stats = getStats();
  const studyPlan = buildStudyPlan(stats);

  let content = "";
  if (state.screen === "dashboard") content = renderDashboard(filteredBank, stats, studyPlan, exams);
  if (state.screen === "import") content = renderImport();
  if (state.screen === "builder") content = renderBuilder(filteredBank, disciplinas, exams);
  if (state.screen === "library") content = renderLibrary(filteredBank, disciplinas, exams);
  if (state.screen === "files") content = renderFiles(exams);
  if (state.screen === "exam") content = renderExam();
  if (state.screen === "results") content = renderResults();

  app.innerHTML = `
    <main class="shell">
      <section class="topbar">
        <div class="title-row">
          <div class="title-block">
            <h1>Sistema de Simulados Interativos OAB</h1>
            <p>Versao estatica com fluxo completo de banco de questoes, simulados e importacao automatica de PDFs.</p>
          </div>
        </div>
        <div class="screen-tabs">
          ${[
            ["dashboard", "Dashboard"],
            ["import", "Importar PDFs"],
            ["builder", "Novo simulado"],
            ["library", "Banco de questoes"],
            ["files", "Acervo"]
          ].map(([key, label]) => `<button class="tab-button ${state.screen === key ? "active" : ""}" data-action="go-screen" data-screen="${key}">${label}</button>`).join("")}
        </div>
      </section>
      ${content}
    </main>
  `;
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;

  if (action === "go-screen") {
    setScreen(button.dataset.screen);
    return;
  }

  if (action === "clear-imported") {
    clearImportedData();
    return;
  }

  if (action === "toggle-files-panel") {
    state.showFilesPanel = !state.showFilesPanel;
    render();
    return;
  }

  if (action === "start-exam") {
    startExam();
    return;
  }

  if (action === "answer-exam") {
    selectExamAnswer(button.dataset.questionId, Number(button.dataset.optionIndex));
    return;
  }

  if (action === "answer-library") {
    selectLibraryAnswer(button.dataset.questionId, Number(button.dataset.optionIndex));
    return;
  }

  if (action === "toggle-mark") {
    const q = state.simulado[state.current];
    if (!q) return;
    state.marked = { ...state.marked, [q.id]: !state.marked[q.id] };
    render();
    return;
  }

  if (action === "exam-prev") {
    state.current = Math.max(state.current - 1, 0);
    render();
    return;
  }

  if (action === "exam-next") {
    state.current = Math.min(state.current + 1, state.simulado.length - 1);
    render();
    return;
  }

  if (action === "finish-exam") {
    finishExam();
    return;
  }

  if (action === "jump-exam") {
    state.current = Number(button.dataset.index);
    render();
    return;
  }

  if (action === "start-library-session") {
    startLibrarySession();
    return;
  }

  if (action === "apply-nav-size") {
    applyNavSessionSize();
    return;
  }

  if (action === "clear-library-session") {
    clearLibrarySession();
    return;
  }

  if (action === "library-prev") {
    if (state.librarySession.length > 0) {
      state.librarySessionIndex = Math.max(state.librarySessionIndex - 1, 0);
    } else {
      state.libraryIndex = Math.max(state.libraryIndex - 1, 0);
    }
    render();
    return;
  }

  if (action === "library-next") {
    const questions = state.librarySession.length > 0 ? state.librarySession : getFilteredBank();
    if (state.librarySession.length > 0) {
      state.librarySessionIndex = Math.min(state.librarySessionIndex + 1, questions.length - 1);
    } else {
      state.libraryIndex = Math.min(state.libraryIndex + 1, questions.length - 1);
    }
    render();
    return;
  }

  if (action === "jump-library") {
    if (state.librarySession.length > 0) {
      state.librarySessionIndex = Number(button.dataset.index);
    } else {
      state.libraryIndex = Number(button.dataset.index);
    }
    render();
  }
});

app.addEventListener("change", async (event) => {
  const target = event.target;

  if (target.id === "questionPdfInput") {
    await handleQuestionPdfImport(Array.from(target.files || []));
    target.value = "";
    return;
  }

  if (target.id === "gabaritoPdfInput") {
    await handleGabaritoPdfImport(Array.from(target.files || []));
    target.value = "";
    return;
  }

  if (target.id === "disciplinaFiltro" || target.id === "libraryDisciplinaFiltro") {
    state.disciplinaFiltro = target.value;
    resetLibraryView();
    render();
    return;
  }

  if (target.id === "examFilter" || target.id === "libraryExamFilter") {
    state.examFilter = target.value;
    resetLibraryView();
    render();
    return;
  }

  if (target.id === "instantFeedback") {
    state.instantFeedback = target.checked;
    render();
    return;
  }

  if (target.id === "librarySessionSize") {
    state.librarySessionSize = target.value;
    return;
  }

  if (target.id === "navSessionSize") {
    state.navSessionSize = target.value;
  }
});

app.addEventListener("input", (event) => {
  const target = event.target;

  if (target.id === "quantidade") {
    state.quantidade = target.value;
    render();
    return;
  }

  if (target.id === "searchInput") {
    state.search = target.value;
    resetLibraryView();
    render();
  }
});

render();

