import type { Meta, StoryObj } from "@storybook/react";
import { Scene } from "../context/Scene";
import { HeatmapPlane } from "../HeatmapPlane";
import { HeatmapData } from "../Heatmap";

const meta = {
  title: "heatmap",
  component: HeatmapPlane,
} satisfies Meta<typeof HeatmapPlane>;
export default meta;

type Story = StoryObj<typeof HeatmapPlane>;

export const Test: Story = {
  render: () => {
    const data: HeatmapData = [];
    for (let i = 0; i < 3; i++) {
      data.push([Math.random() * 20, Math.random() * 30, Math.random() * 1500]);
    }
    return (
      <Scene>
        <HeatmapPlane data={data} />
      </Scene>
    );
  },
};
