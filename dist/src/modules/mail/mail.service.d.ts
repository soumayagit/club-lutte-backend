export declare class MailService {
    private transporter;
    sendPasswordResetEmail(to: string, firstName: string, resetLink: string): Promise<void>;
}
