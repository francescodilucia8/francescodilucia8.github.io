export const profile = {
  name: "Francesco Di Lucia",
  email: "francescodilucia8@gmail.com",
  github: "https://github.com/francescodilucia8",
  location: "Turin, Italy",
  education: "MSc in Computer Engineering · AI and Data Analytics",
  university: "Politecnico di Torino · 2026",
};

export interface Section {
  title: string;
  paragraphs: string[];
}
export interface Project {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  category: string;
  status: string;
  summary: string;
  stack: string[];
  repo: string;
  role: string;
  question: string;
  sections: Section[];
}

export const projects: Project[] = [
  {
    slug: "multispectral-thesis",
    number: "01",
    title: "Classifying plant health from multispectral images.",
    shortTitle: "Multispectral plant classification",
    category: "Applied machine learning",
    status: "MSc thesis · DRONUTS",
    summary:
      "From UAV imagery to image-patch classification. An experimental study of what preprocessing changes—and what it cannot solve.",
    stack: ["Python", "PyTorch", "OpenCV"],
    repo: `${profile.github}/multispectral-plant-disease-classification`,
    role: "Research intern & MSc thesis researcher · DAUIN, Politecnico di Torino · July 2025–July 2026",
    question:
      "Can multispectral imagery help distinguish healthy from diseased or stressed plant-image patches?",
    sections: [
      {
        title: "The problem starts before the model.",
        paragraphs: [
          "I developed and investigated a classification pipeline within DRONUTS, using UAV imagery of hazelnut orchards. The acquisitions combine an RGB reference with five monochrome spectral bands: blue, green, red, red edge and near infrared.",
          "Those views do not line up perfectly. Overlapping canopies, shadows and changes in illumination add another layer of uncertainty. The labels describe image regions, so a single patch can contain mixed tissue or subtle symptoms.",
        ],
      },
      {
        title: "Making the inputs comparable.",
        paragraphs: [
          "I aligned the spectral bands to NIR using optical-center metadata and translation-only ECC refinement. Percentile normalization stabilized intensity ranges before constructing the input representations.",
          "I compared NDVI-based vegetation masks and central-component selection with a simpler central square crop. A separate manual-crop diagnostic helped test whether selecting the wrong tree was the main bottleneck. It was a diagnostic control, rather than a deployable automatic method.",
        ],
      },
      {
        title: "An experiment, with explicit alternatives.",
        paragraphs: [
          "I compared RGB, raw multispectral channels, vegetation indices and optional mask information. I tested a baseline CNN, adapted ResNet18 and custom residual architectures. These are different experimental configurations; adding every channel was not consistently better.",
          "Patch generation feeds distinct training, validation and test partitions with group-aware splitting. Training and model selection happen before inference; evaluation compares held-out predictions with the reference labels.",
        ],
      },
      {
        title: "The useful result was also a limit.",
        paragraphs: [
          "Band alignment mattered, while stricter background removal did not consistently help. The manual-crop diagnostic did not remove the performance ceiling. The study points to data quality and patch-label ambiguity as central constraints.",
          "Many configurations favored recall over precision. These results describe the thesis experiments on this dataset. They do not establish whole-plant diagnosis, causal disease identification or generalization to new orchards and seasons.",
        ],
      },
    ],
  },
  {
    slug: "local-ai",
    number: "02",
    title: "A workspace for local AI.",
    shortTitle: "LLittlebrain",
    category: "LLM applications",
    status: "Personal local application",
    summary:
      "Conversations, documents and retrieval in one local application. Built around the software a model needs to become useful.",
    stack: ["React / TypeScript", "FastAPI", "Ollama"],
    repo: `${profile.github}/LLittlebrain`,
    role: "Personal project · full-stack application",
    question:
      "How do you connect local language models to persistent conversations and useful document context?",
    sections: [
      {
        title: "The application around the model.",
        paragraphs: [
          "I built a React and TypeScript interface backed by a Python FastAPI service and Ollama. The application streams model responses and stores conversations in SQLite, so a session can continue beyond a single prompt.",
          "The frontend, API, conversation store and model service have separate responsibilities. Keeping those boundaries explicit makes connection failures and model-dependent behavior easier to handle.",
        ],
      },
      {
        title: "Two ways to use a document.",
        paragraphs: [
          "Document ingestion extracts text and can supply it directly as context. For retrieval, the backend creates overlapping chunks, obtains local embeddings through Ollama, and indexes the chunks in ChromaDB.",
          "A query retrieves relevant passages with source metadata. The application carries document references alongside the response, allowing the user to inspect the context used by the model.",
        ],
      },
      {
        title: "Local does not mean effortless.",
        paragraphs: [
          "The application requires a running local Ollama service and appropriate models. Image support depends on the selected model. PDF text extraction does not establish OCR support for scanned documents.",
          "This is a local application, with no claim of cloud synchronization, production authentication or measured model accuracy. The diagram here explains the architecture; it does not run a model in your browser.",
        ],
      },
    ],
  },
  {
    slug: "bounded-agents",
    number: "03",
    title: "Agents with a stopping point.",
    shortTitle: "Bounded Agent Lab",
    category: "Agent systems",
    status: "Work-in-progress prototype",
    summary:
      "A tool-using runtime with explicit budgets, separate execution modes and a human review step before file export.",
    stack: ["Python", "MCP", "Docker"],
    repo: `${profile.github}/bounded-agent-lab`,
    role: "Personal project · agent runtime prototype",
    question:
      "How can an open-ended agent run stay understandable, bounded and reviewable?",
    sections: [
      {
        title: "Bound the work, then give it tools.",
        paragraphs: [
          "I built a Python prototype using the OpenAI Agents SDK, OpenRouter and MCP. The coordinator accounts for requests, tools, tokens, elapsed time and estimated model cost, with checks around model requests and tool use.",
          "Context limits reserve room for a final response. Usage logging and regression tests support debugging execution limits and failure handling.",
        ],
      },
      {
        title: "One mode per run.",
        paragraphs: [
          "The offline code worker uses a Docker environment with no network and read-only input. Its temporary working area holds candidate output, which reaches a human preview and export step before persistence.",
          "Public research runs in a separate networked worker without host-file mounts. The coordinator selects one mode at a time. A shared context combining private-file access and arbitrary public-web tools is rejected by the documented design.",
        ],
      },
      {
        title: "A prototype with visible boundaries.",
        paragraphs: [
          "Host-side accounting and estimated cost are not provider-enforced billing guarantees. Container isolation addresses specific exposures; it does not establish a malware-proof sandbox or a security certification.",
          "Offline code execution does not mean the whole interaction stays off cloud providers: selected outputs can enter model context. The research mode supports public fetching and search, without credentialed browsing or transactions.",
        ],
      },
    ],
  },
];

export const thesisBeats = [
  {
    id: "inputs",
    label: "Spectral inputs",
    description:
      "An RGB reference and five spectral bands provide complementary views of the same acquisition.",
    time: 0,
  },
  {
    id: "alignment",
    label: "Align the bands",
    description:
      "Optical-center metadata and ECC refinement align the spectral bands to NIR.",
    time: 2.4,
  },
  {
    id: "region",
    label: "Region & mask",
    description:
      "Normalize radiometry, threshold NDVI and clean vegetation masks. Compare region extraction with square cropping; boundaries remain imperfect.",
    time: 4.8,
  },
  {
    id: "patches",
    label: "Extract image patches",
    description:
      "Divide the selected region into a 3 × 3 grid, then resize each patch to 224 × 224 pixels.",
    time: 7.2,
  },
  {
    id: "features",
    label: "Feature channels",
    description:
      "Compute five vegetation indices per patch. Compare raw bands, indices and optional mask channels across experimental configurations.",
    time: 9.6,
  },
  {
    id: "training",
    label: "Train & select offline",
    description:
      "Keep field-and-plant groups separate across splits. Fit on training groups, select on validation groups, and compute channel statistics on training data only.",
    time: 12,
  },
  {
    id: "inference",
    label: "Classify prepared patches",
    description:
      "Pass prepared patches through the frozen classifier. Patch predictions do not diagnose an entire plant.",
    time: 14.4,
  },
  {
    id: "evaluation",
    label: "Held-out evaluation",
    description:
      "Compare held-out patch predictions with labels. Training and model selection are separate steps.",
    time: 16.8,
  },
] as const;
export const thesisDuration = 19.2;
