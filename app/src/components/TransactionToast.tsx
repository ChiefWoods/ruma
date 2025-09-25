export function TransactionToast({
  title,
  link,
  linkText = 'View transaction',
}: {
  title: string;
  link?: string;
  linkText?: string;
}) {
  return (
    <div className="flex flex-col">
      <p>{title}</p>
      {link && linkText && (
        <a href={link} target="_blank" className="text-blue-400 underline">
          {linkText}
        </a>
      )}
    </div>
  );
}
