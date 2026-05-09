import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Poetry & BGM Studio", () => {
  it("renders the Korean classroom studio title and primary recording action", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "감성 톡톡 동시 스튜디오: 내 목소리 오디오북",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "낭송 녹음 시작" })).toBeInTheDocument();
  });
});
