package mail

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"time"

	gomail "github.com/wneessen/go-mail"

	"github.com/ShinysArc/photography-portfolio/server/internal/config"
)

type Mailer struct {
	client *gomail.Client
	from   string
	to     string
}

func NewMailer(cfg config.Config) (*Mailer, error) {
	if cfg.SMTPHost == "" || cfg.SMTPUser == "" || cfg.SMTPPass == "" || cfg.ContactFrom == "" || cfg.ContactTo == "" {
		return nil, errors.New("SMTP/Contact env not fully configured")
	}

	opts := []gomail.Option{
		gomail.WithPort(cfg.SMTPPort),
		gomail.WithSMTPAuth(gomail.SMTPAuthPlain),
		gomail.WithUsername(cfg.SMTPUser),
		gomail.WithPassword(cfg.SMTPPass),
		gomail.WithTimeout(20 * time.Second),

		// TLS setup
		gomail.WithTLSPolicy(gomail.TLSMandatory),
		gomail.WithTLSConfig(&tls.Config{ServerName: cfg.SMTPHost}),
	}

	// If using implicit TLS (465), enable SSL mode
	if cfg.SMTPPort == 465 {
		opts = append(opts, gomail.WithSSL())
	}

	c, err := gomail.NewClient(cfg.SMTPHost, opts...)
	if err != nil {
		return nil, err
	}
	return &Mailer{client: c, from: cfg.ContactFrom, to: cfg.ContactTo}, nil
}

func (m *Mailer) Send(ctx context.Context, replyTo, subject, text, html string) error {
	if m == nil || m.client == nil {
		return errors.New("mailer not initialized")
	}

	msg := gomail.NewMsg()
	if err := msg.From(m.from); err != nil {
		return fmt.Errorf("from: %w", err)
	}
	if err := msg.To(m.to); err != nil {
		return fmt.Errorf("to: %w", err)
	}
	if replyTo != "" {
		msg.SetGenHeader("Reply-To", replyTo)
	}
	msg.Subject(subject)

	if html != "" {
		msg.SetBodyString(gomail.TypeTextPlain, text)
		msg.AddAlternativeString(gomail.TypeTextHTML, html)
	} else {
		msg.SetBodyString(gomail.TypeTextPlain, text)
	}

	ctx, cancel := context.WithTimeout(ctx, 25*time.Second)
	defer cancel()

	return m.client.DialAndSendWithContext(ctx, msg)
}
