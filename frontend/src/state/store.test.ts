import { describe, it, expect, beforeEach } from "vitest";
import { useStore, type RunState } from "./store";
import { heatPreset } from "../gallery/examples";

const baseRun = (): RunState => ({
  status: "pristine",
  fields: null,
  activeFieldIndex: 0,
  visibleFieldIndices: [0],
  lastRunMs: 0,
  history: [],
  error: null,
  meta: null,
});

beforeEach(() => {
  useStore.setState({ system: heatPreset(), run: baseRun() });
});

describe("addPde", () => {
  it("appends a uniquely-named PDE and makes it active", () => {
    useStore.getState().addPde();
    const { pdes, activePdeId } = useStore.getState().system;
    expect(pdes).toHaveLength(2);
    expect(pdes[1].func).toBe("u1");
    expect(activePdeId).toBe(pdes[1].id);
  });
});

describe("removePde", () => {
  it("is a no-op when only one PDE remains", () => {
    useStore.getState().removePde(useStore.getState().system.pdes[0].id);
    expect(useStore.getState().system.pdes).toHaveLength(1);
  });

  it("removes a PDE and shifts active field / visible indices down", () => {
    const store = useStore.getState();
    store.addPde(); // now [u, u1], active = u1
    useStore.setState((s) => ({
      run: { ...s.run, visibleFieldIndices: [0, 1], activeFieldIndex: 1 },
    }));
    const firstId = useStore.getState().system.pdes[0].id;
    useStore.getState().removePde(firstId);

    const { system, run } = useStore.getState();
    expect(system.pdes).toHaveLength(1);
    expect(system.pdes[0].func).toBe("u1");
    expect(run.visibleFieldIndices).toEqual([0]);
    expect(run.activeFieldIndex).toBe(0);
  });
});

describe("toggleVisibleField", () => {
  beforeEach(() => {
    useStore.getState().addPde(); // 2 PDEs -> valid field indices 0 and 1
  });

  it("adds a hidden field and makes it active", () => {
    useStore.getState().toggleVisibleField(1);
    expect(useStore.getState().run.visibleFieldIndices).toEqual([0, 1]);
    expect(useStore.getState().run.activeFieldIndex).toBe(1);
  });

  it("removes a visible field but never empties the selection", () => {
    useStore.getState().toggleVisibleField(1); // [0, 1]
    useStore.getState().toggleVisibleField(0); // -> [1]
    expect(useStore.getState().run.visibleFieldIndices).toEqual([1]);
    useStore.getState().toggleVisibleField(1); // last one stays
    expect(useStore.getState().run.visibleFieldIndices).toEqual([1]);
  });

  it("ignores out-of-range indices", () => {
    useStore.getState().toggleVisibleField(99);
    expect(useStore.getState().run.visibleFieldIndices).toEqual([0]);
  });
});
