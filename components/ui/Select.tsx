"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";

type Props = {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

/** Select-only combobox. Options stay styled consistently across browsers. */
export function Select({
  children,
  value,
  defaultValue,
  onChange,
  name,
  id,
  disabled,
  className,
  "aria-label": label,
}: Props) {
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const props = child.props as {
        value: string;
        children: ReactNode;
        disabled?: boolean;
      };
      return {
        value: props.value,
        label: props.children,
        disabled: props.disabled,
      };
    });
  const initial = defaultValue ?? options[0]?.value ?? "";
  const [internal, setInternal] = useState(initial);
  const selected = value ?? internal;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const generated = useId();
  const listId = `${generated}-list`;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef({ text: "", time: 0 });
  function close() {
    setOpen(false);
  }
  function choose(index: number) {
    if (!options[index] || options[index].disabled) return;
    setInternal(options[index].value);
    onChange?.(options[index].value);
    close();
    trigger.current?.focus();
  }
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", outside);
    const form = trigger.current?.closest("form");
    const reset = () => {
      setInternal(initial);
      close();
    };
    form?.addEventListener("reset", reset);
    return () => {
      document.removeEventListener("pointerdown", outside);
      form?.removeEventListener("reset", reset);
    };
  }, [initial]);
  useEffect(() => {
    if (disabled) close();
  }, [disabled]);
  useEffect(() => {
    if (open)
      document
        .getElementById(`${listId}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);
  const index = options.findIndex((option) => option.value === selected);
  return (
    <div
      ref={root}
      className="relative min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) close();
      }}
    >
      {name && (
        <input type="hidden" name={name} value={selected} disabled={disabled} />
      )}
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        disabled={disabled}
        className={`${className || "rounded-xl border border-forest-200 bg-white p-3"} flex w-full items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-forest-500 disabled:opacity-50`}
        onClick={() => {
          setActive(Math.max(0, index));
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            close();
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            close();
            return;
          }
          if (["Enter", " "].includes(event.key)) {
            event.preventDefault();
            if (open) choose(active);
            else {
              setActive(Math.max(0, index));
              setOpen(true);
            }
            return;
          }
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
            const enabled = options
              .map((o, i) => (o.disabled ? -1 : i))
              .filter((i) => i >= 0);
            const position = enabled.indexOf(open ? active : index);
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? enabled.length - 1
                  : Math.max(
                      0,
                      Math.min(
                        enabled.length - 1,
                        position + (event.key === "ArrowDown" ? 1 : -1),
                      ),
                    );
            setActive(enabled[next] ?? 0);
            return;
          }
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            search.current = {
              text:
                (Date.now() - search.current.time < 700
                  ? search.current.text
                  : "") + event.key.toLowerCase(),
              time: Date.now(),
            };
            const found = options.findIndex(
              (o) =>
                !o.disabled &&
                Children.toArray(o.label)
                  .join("")
                  .toLowerCase()
                  .startsWith(search.current.text),
            );
            if (found >= 0) {
              setActive(found);
              setOpen(true);
            }
          }
        }}
      >
        <span className="truncate">
          {options[index]?.label ?? "Choose an option"}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label || "Options"}
          className="absolute left-0 right-0 z-[60] mt-2 max-h-64 overflow-auto rounded-2xl border border-forest-200 bg-white p-1.5 text-forest-950 shadow-xl"
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={selected === option.value}
              aria-disabled={option.disabled || undefined}
              onPointerDown={(event) => event.preventDefault()}
              onClick={(event) => { event.preventDefault(); choose(i); }}
              onPointerMove={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ${active === i ? "bg-forest-50" : ""} ${option.disabled ? "opacity-40" : ""}`}
            >
              <span>{option.label}</span>
              {selected === option.value && (
                <Check aria-hidden className="h-4 w-4 shrink-0" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
