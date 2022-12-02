export function MonospaceImitation({ children }: { children: string }) {
  return (
    <>
      {[...children].map((x, i) => (
        <span key={i} className={`text-center ${":.".includes(x) ? "" : "w-[1.8vw]"}`}>
          {x}
        </span>
      ))}
    </>
  );
}
