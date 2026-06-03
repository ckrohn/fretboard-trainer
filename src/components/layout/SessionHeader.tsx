type SessionHeaderProps = {
  title: string;
};

export function SessionHeader({ title }: SessionHeaderProps) {
  return <h2 className="text-lg font-semibold text-slate-950">{title}</h2>;
}
