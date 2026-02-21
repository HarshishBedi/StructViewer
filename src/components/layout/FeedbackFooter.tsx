import { useEffect, useMemo, useState, type FormEventHandler } from 'react';
import { Button } from '../ui/Button';
import { useAlgoStore } from '../../lib/state/useAlgoStore';

type FeedbackType = 'bug' | 'enhancement';

const REPO_ISSUES_URL = 'https://github.com/HarshishBedi/algovis/issues/new';
const REPO_ISSUES_API_URL = 'https://api.github.com/repos/HarshishBedi/algovis/issues';
const REPO_URL = 'https://github.com/HarshishBedi/algovis';
const GITHUB_TOKEN_STORAGE_KEY = 'structviewer.github-token';

interface StatusMessage {
  tone: 'success' | 'error' | 'info';
  message: string;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildIssueContent(params: {
  type: FeedbackType;
  title: string;
  details: string;
  moduleLabel: string;
}): { issueTitle: string; issueBody: string } {
  const { type, title, details, moduleLabel } = params;
  const cleanTitle = title.trim();
  const issueTitle =
    cleanTitle.length > 0 ? cleanTitle : `[${capitalize(type)}] ${moduleLabel} feedback`;

  const context = [
    `Type: ${type}`,
    `Module: ${moduleLabel}`,
    `Timestamp: ${new Date().toISOString()}`,
    `Page: ${window.location.href}`
  ];

  const issueBody = [
    '## Summary',
    details.trim() || 'Describe your feedback here.',
    '',
    '## Context',
    ...context.map((line) => `- ${line}`)
  ].join('\n');

  return { issueTitle, issueBody };
}

function buildIssueUrl(params: {
  issueTitle: string;
  issueBody: string;
  type: FeedbackType;
}): string {
  const { issueTitle, issueBody, type } = params;

  const query = new URLSearchParams({
    title: issueTitle,
    body: issueBody,
    labels: type
  });

  return `${REPO_ISSUES_URL}?${query.toString()}`;
}

export function FeedbackFooter() {
  const activeModule = useAlgoStore((state) => state.activeModule);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('enhancement');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [rememberToken, setRememberToken] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<StatusMessage | null>(null);

  const moduleLabel = capitalize(activeModule);
  const { issueTitle, issueBody } = useMemo(
    () =>
      buildIssueContent({
        type,
        title,
        details,
        moduleLabel
      }),
    [details, moduleLabel, title, type]
  );

  const issueUrl = useMemo(
    () =>
      buildIssueUrl({
        issueTitle,
        issueBody,
        type
      }),
    [issueBody, issueTitle, type]
  );

  const persistTokenPreference = (token: string) => {
    if (rememberToken) {
      window.localStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, token);
      return;
    }
    window.localStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
  };

  const submitIssueRequest = async (token: string) => {
    const response = await fetch(REPO_ISSUES_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: [type]
      })
    });

    if (response.status === 201) {
      const payload = (await response.json()) as { html_url?: string };
      return {
        ok: true,
        issueUrl: payload.html_url ?? REPO_URL,
        message: 'Issue created via GitHub REST API.'
      };
    }

    let message = `GitHub API returned ${response.status}.`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // keep fallback message
    }

    return { ok: false, message };
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const token = githubToken.trim();
    if (!token) {
      window.open(issueUrl, '_blank', 'noopener,noreferrer');
      setFeedbackStatus({
        tone: 'info',
        message: 'Opened prefilled issue page. Add a GitHub token to submit directly via API.'
      });
      setOpen(false);
      setTitle('');
      setDetails('');
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackStatus({
      tone: 'info',
      message: 'Creating issue via GitHub API...'
    });

    try {
      const result = await submitIssueRequest(token);
      if (result.ok) {
        persistTokenPreference(token);
        setFeedbackStatus({
          tone: 'success',
          message: result.message
        });
        window.open(result.issueUrl, '_blank', 'noopener,noreferrer');
        setOpen(false);
        setTitle('');
        setDetails('');
      } else {
        window.open(issueUrl, '_blank', 'noopener,noreferrer');
        setFeedbackStatus({
          tone: 'error',
          message: `API issue creation failed (${result.message}). Opened prefilled issue page.`
        });
        setOpen(false);
      }
    } catch {
      window.open(issueUrl, '_blank', 'noopener,noreferrer');
      setFeedbackStatus({
        tone: 'error',
        message: 'Network error with GitHub API. Opened prefilled issue page.'
      });
      setOpen(false);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const stored = window.localStorage.getItem(GITHUB_TOKEN_STORAGE_KEY);
    if (stored) {
      setGithubToken(stored);
      setRememberToken(true);
    }
  }, []);

  return (
    <footer className="feedback-footer" aria-label="Product feedback">
      <div className="feedback-footer-head">
        <div>
          <h2>Feedback</h2>
          <p>Share bugs and enhancements without leaving the workspace context.</p>
        </div>
        <div className="feedback-footer-actions">
          <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Send Feedback
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => window.open(REPO_URL, '_blank', 'noopener,noreferrer')}
          >
            View Repo
          </Button>
        </div>
      </div>
      {feedbackStatus && (
        <p className="feedback-status" data-tone={feedbackStatus.tone} aria-live="polite">
          {feedbackStatus.message}
        </p>
      )}

      {open && (
        <div className="modal-overlay" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="modal-card feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Create feedback issue"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header feedback-modal-header">
              <div>
                <h3>Send Feedback</h3>
                <p>Creates an issue via GitHub API when token is provided.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </header>

            <form className="feedback-modal-form" onSubmit={onSubmit}>
              <label className="feedback-field feedback-type">
                <span>Type</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as FeedbackType)}
                >
                  <option value="bug">Bug</option>
                  <option value="enhancement">Enhancement</option>
                </select>
              </label>

              <label className="feedback-field feedback-title">
                <span>Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={`Short ${type} title`}
                />
              </label>

              <label className="feedback-field feedback-details">
                <span>Details</span>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  rows={4}
                  placeholder="What happened, what did you expect, and what should be improved?"
                />
              </label>

              <label className="feedback-field feedback-title">
                <span>GitHub Token (optional)</span>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(event) => setGithubToken(event.target.value)}
                  placeholder="Provide token to create issue via API"
                  autoComplete="off"
                />
              </label>

              <label className="feedback-check">
                <input
                  type="checkbox"
                  checked={rememberToken}
                  onChange={(event) => setRememberToken(event.target.checked)}
                />
                <span>Remember token on this device</span>
              </label>

              <div className="feedback-modal-actions">
                <a href={REPO_URL} target="_blank" rel="noreferrer" className="feedback-repo-link">
                  Open Repository
                </a>
                <div className="feedback-modal-actions-right">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" loading={submittingFeedback}>
                    Create GitHub Issue
                  </Button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
    </footer>
  );
}
