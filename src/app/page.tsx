import Link from "next/link"
import styles from "./page.module.css"

// Update these hrefs to match your app's routes.
const actions = [
  {
    href: "/report",
    title: "Report a payment problem",
    note: "Unauthorized, failed or delayed payments, refunds, scams",
  },
  {
    href: "/check",
    title: "Check a link or QR code",
    note: "Get a risk assessment before you pay",
  },
  {
    href: "/cases",
    title: "Track my complaint",
    note: "Status, department and updates",
  },
]

const tips = [
  [
    "Never share OTPs or PINs",
    "Your bank will never ask for your OTP, UPI PIN, CVV, password or card details by call, message or email.",
  ],
  [
    "Verify before you pay",
    "Check the recipient's name, UPI ID, account details and amount before you confirm.",
  ],
  [
    "Don't trust urgency",
    "“Your account will be blocked today” and “Complete KYC now” are common fraud tactics. Stop and verify.",
  ],
  [
    "Skip suspicious links",
    "Ignore links in unexpected SMS, WhatsApp, email or social messages asking you to verify your account.",
  ],
  [
    "Scan QR codes only to pay",
    "A QR code is for sending money, not receiving it. Don't scan unknown codes or follow unverified instructions.",
  ],
  [
    "Don't install unknown apps",
    "Fraudsters ask people to install screen-sharing or remote-access apps. Never give anyone access to your device.",
  ],
  [
    "Use official banking apps",
    "Download from official app stores only, and check the developer name before installing.",
  ],
  [
    "Act fast on unknown transactions",
    "Contact your bank immediately and report the transaction through an official channel.",
  ],
  [
    "Keep your devices updated",
    "Update your operating system, browser, banking apps and security software.",
  ],
  [
    "Unsure? Check first",
    "Run any payment link or QR code through Check a link or QR code before you touch it.",
  ],
]

const faqs = [
  [
    "What is FinTrust-AI?",
    "A digital-payment dispute and fraud-management platform. It helps you report payment issues, analyse suspicious activity, track complaints, and connect cases with the right resolution authority.",
  ],
  [
    "What can I report?",
    "Failed transactions, unauthorized payments, payment or refund delays, phishing attempts, QR-code scams, suspicious payment links, merchant-related payment issues, and other digital-payment disputes.",
  ],
  [
    "What do I need to file a complaint?",
    "Depending on the issue: transaction details, the amount, a description of what happened, and any screenshots, receipts, suspicious links, QR codes or other evidence.",
  ],
  [
    "Is my personal information protected?",
    "FinTrust-AI is designed to mask sensitive information before its AI components process it. You should still never share passwords, OTPs, PINs or other credentials.",
  ],
  [
    "Can it check a suspicious link or QR code?",
    "Yes. Submit a payment URL or QR code in Check a link or QR code. The system looks for suspicious characteristics and gives you a risk assessment.",
  ],
  [
    "Will FinTrust-AI resolve my complaint automatically?",
    "No. The system provides analysis, risk assessment, routing and decision support. Authorized personnel review each case and take action.",
  ],
  [
    "How do I track my complaint?",
    "Open My cases to see your complaints, their status, the assigned department, updates and resolution progress.",
  ],
  [
    "What happens after I submit?",
    "The system analyses your complaint, picks out the relevant details, assesses fraud and severity indicators, and routes the case to the right department for review.",
  ],
  [
    "Can I escalate my complaint?",
    "Yes. If a case needs further intervention, it can be escalated to the appropriate authority following the case and departmental workflow.",
  ],
  [
    "I already shared an OTP or banking credentials. What now?",
    "Contact your bank right away through its official support channel, secure your account, and report any unauthorized transaction as soon as possible.",
  ],
  [
    "Will FinTrust-AI ask for my OTP, PIN or password?",
    "No. Never enter or share your OTP, UPI PIN, card PIN, CVV or banking password in a complaint or verification request.",
  ],
]

function Arrow() {
  return (
    <svg className={styles.arrow} viewBox="0 0 28 12" aria-hidden="true">
      <path className={styles.arrowLine} d="M1 6H26" />
      <path className={styles.arrowHead} d="M21 1l5 5-5 5" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.bar}`}>
          <Link href="/" className={styles.logo}>
            FinTrust-AI
          </Link>
          <div className={styles.barEnd}>
            <Link href="/login" className={styles.login}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.wrap}>
            <div className={styles.head}>
              <h1 className={styles.title}>
                A payment went wrong ? <br /> Let’s trace it.
              </h1>
              <p className={styles.lead}>
                Report it, check a suspicious link or QR code, and follow your case until it’s
                resolved.
              </p>
            </div>

            <div className={styles.vizWide}>
              <svg
                className={styles.routeWide}
                viewBox="0 0 1120 224"
                role="img"
                aria-label="A payment leaves you, goes to the wrong account, and is traced back to you"
              >
                <g className={styles.trail}>
                  <path
                    className={styles.out}
                    pathLength={1}
                    d="M68 80C320 80 340 30 580 40C800 50 820 80 1040 80"
                  />
                  <path className={styles.head1} d="M1030 70L1044 80L1030 90" />
                  <path
                    className={styles.back}
                    pathLength={1}
                    d="M1080 106C1080 178 1060 190 990 190L120 190C60 190 40 175 40 128"
                  />
                  <path className={styles.head2} d="M30 126L40 112L50 126" />
                </g>
                <circle className={styles.nodeYou} cx="40" cy="80" r="26" />
                <text className={styles.nodeText} x="40" y="85">
                  You
                </text>
                <circle className={styles.ring} cx="1080" cy="80" r="26" />
                <circle className={styles.nodeBad} cx="1080" cy="80" r="26" />
                <text className={styles.nodeText} x="1080" y="87" fontSize="22">
                  !
                </text>
                <text className={styles.routeLabel} x="560" y="216">
                  Trace it back
                </text>
              </svg>
            </div>

            <div className={styles.vizNarrow}>
              <svg
                className={styles.route}
                viewBox="0 0 520 420"
                role="img"
                aria-label="A payment leaves you, goes to the wrong account, and is traced back to you"
              >
                <g className={styles.trail}>
                  <path className={styles.out} pathLength={1} d="M96 320C220 320 180 110 400 110" />
                  <path className={styles.head1} d="M390 100L404 110L390 120" />
                  <path
                    className={styles.back}
                    pathLength={1}
                    d="M430 136C430 240 470 380 250 380C160 380 70 380 70 356"
                  />
                  <path className={styles.head2} d="M60 366L70 352L80 366" />
                </g>
                <circle className={styles.nodeYou} cx="70" cy="320" r="26" />
                <text className={styles.nodeText} x="70" y="325">
                  You
                </text>
                <circle className={styles.ring} cx="430" cy="110" r="26" />
                <circle className={styles.nodeBad} cx="430" cy="110" r="26" />
                <text className={styles.nodeText} x="430" y="117" fontSize="22">
                  !
                </text>
                <text className={styles.routeLabel} x="250" y="408">
                  Trace it back
                </text>
              </svg>
            </div>

            <div className={styles.acts}>
              <ul className={styles.actions}>
                {actions.map((a) => (
                  <li key={a.href}>
                    <Link href={a.href} className={styles.action}>
                      <span>
                        <span className={styles.actionTitle}>{a.title}</span>
                        <span className={styles.actionNote}>{a.note}</span>
                      </span>
                      <Arrow />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className={styles.urgent}>
                <strong>Already shared an OTP or PIN?</strong> Call your bank first, then report it
                here.
              </p>
            </div>
          </div>
        </section>

        <section id="about" className={styles.section}>
          <div className={`${styles.wrap} ${styles.split}`}>
            <h2 className={styles.heading}>About</h2>
            <div className={styles.prose}>
              <p className={styles.big}>
                FinTrust-AI helps you report digital payment problems and follow your complaint
                until it’s resolved. AI reads your report, flags fraud signals and routes the case
                to the right department.
              </p>
              <p>
                People review every case and decide what happens next. The system is built to mask
                sensitive details before the AI processes them.
              </p>
            </div>
          </div>
        </section>

        <section id="safety" className={`${styles.section} ${styles.band}`}>
          <div className={`${styles.wrap} ${styles.split}`}>
            <h2 className={styles.heading}>Stay safe from payment fraud</h2>
            <dl className={styles.tips}>
              {tips.map(([lead, text]) => (
                <div key={lead}>
                  <dt>{lead}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="faq" className={styles.section}>
          <div className={`${styles.wrap} ${styles.split}`}>
            <h2 className={styles.heading}>Questions</h2>
            <div className={styles.faq}>
              {faqs.map(([q, a]) => (
                <details key={q} {...{ name: "faq" }}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.wrap}>FinTrust-AI will never ask for your OTP, PIN or password.</div>
      </footer>
    </div>
  )
}
