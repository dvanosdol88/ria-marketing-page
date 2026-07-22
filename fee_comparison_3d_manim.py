"""
3D Fee Comparison Animation using Manim (Community Edition).

Features:
- Dynamic 3D perspective with ThreeDScene & ThreeDAxes.
- Smooth camera orbit & tilt tracking line growth from Year 0 to Year 20.
- 3D semi-transparent volumetric fill under each curve (Blue & Green walls).
- Floating 3D milestone markers at Year 5, 10, 15, and 20.
- Cinematic camera transition at Year 20 focusing on the $788,000 wealth gap.

To render this animation with Manim:
    python -m manim -pql fee_comparison_3d_manim.py FeeComparison3DScene

For high quality (1080p60):
    python -m manim -pqh fee_comparison_3d_manim.py FeeComparison3DScene
"""

from manim import *
import numpy as np


class FeeComparison3DScene(ThreeDScene):
    """
    3D Manim Scene animating a 20-year investment fee comparison between
    a 1.00% AUM fee and a $100/mo flat fee with a dynamic orbiting camera,
    3D volumetric fills, and a cinematic end-state gap highlight.
    """

    def construct(self):
        # ---------------------------------------------------------
        # 1. Colors & Constants
        # ---------------------------------------------------------
        COLOR_BG = "#0B0F19"       # Deep slate dark background
        COLOR_AUM = "#3B82F6"      # Electric Blue (1.00% AUM fee)
        COLOR_AUM_WALL = "#1D4ED8" # Darker Blue for 3D wall fill
        COLOR_FLAT = "#22C55E"     # Emerald Green ($100/mo flat fee)
        COLOR_FLAT_WALL = "#15803D"# Darker Green for 3D wall fill
        COLOR_DIFF = "#F59E0B"     # Radiant Gold for difference highlight
        COLOR_TEXT = "#F8FAFC"     # Bright white
        COLOR_SUBTEXT = "#94A3B8"  # Muted slate text
        COLOR_GRID = "#1E293B"     # Grid lines

        self.camera.background_color = COLOR_BG

        # Mathematical parameters
        principal = 1_000_000.0
        r_annual = 0.08
        r_m = (1.0 + r_annual) ** (1.0 / 12.0) - 1.0  # Monthly compound rate
        aum_fee_m = 0.01 / 12.0
        flat_fee_m = 100.0

        def get_aum_value(years: float) -> float:
            m = years * 12.0
            factor = (1.0 + r_m) * (1.0 - aum_fee_m)
            return principal * (factor ** m)

        def get_flat_value(years: float) -> float:
            m = years * 12.0
            growth_factor = (1.0 + r_m) ** m
            fee_deduction = (
                flat_fee_m * (growth_factor - 1.0) / r_m
                if r_m > 0
                else flat_fee_m * m
            )
            return principal * growth_factor - fee_deduction

        def aum_func(t: float) -> float:
            return get_aum_value(t) / 1_000_000.0

        def flat_func(t: float) -> float:
            return get_flat_value(t) / 1_000_000.0

        # ---------------------------------------------------------
        # 2. Camera Initial Orientation & 3D Axes Setup
        # ---------------------------------------------------------
        self.set_camera_orientation(
            phi=65 * DEGREES,
            theta=-60 * DEGREES,
            zoom=0.85,
        )

        axes = ThreeDAxes(
            x_range=[0, 20, 5],
            y_range=[0, 5, 1],
            z_range=[0, 2, 1],
            x_length=9.0,
            y_length=4.5,
            z_length=1.5,
            axis_config={
                "color": "#475569",
                "stroke_width": 2,
                "include_tip": False,
            },
            x_axis_config={
                "numbers_to_include": [0, 5, 10, 15, 20],
                "font_size": 18,
                "label_constructor": Text,
            },
            y_axis_config={
                "numbers_to_include": [0, 1, 2, 3, 4, 5],
                "font_size": 18,
                "label_constructor": Text,
            },
        ).shift(DOWN * 0.8 + LEFT * 0.5)

        # ---------------------------------------------------------
        # 3. Fixed Screen UI (Title & Legend Overlay)
        # ---------------------------------------------------------
        title = Text(
            "3D Investment Fee Comparison (20-Year Horizon)",
            font_size=26,
            weight=BOLD,
            color=COLOR_TEXT,
        )
        subtitle = Text(
            "$1,000,000 Principal @ 8.0% Growth  |  1% AUM vs. $100/mo Flat Fee",
            font_size=15,
            color=COLOR_SUBTEXT,
        )
        header_group = VGroup(title, subtitle).arrange(DOWN, buff=0.1)
        header_group.to_corner(UL, buff=0.3)

        legend_flat = VGroup(
            Square(side_length=0.18, fill_color=COLOR_FLAT, fill_opacity=1, stroke_width=0),
            Text("$100/mo Flat Fee", font_size=15, color=COLOR_TEXT, weight=SEMIBOLD),
        ).arrange(RIGHT, buff=0.15)

        legend_aum = VGroup(
            Square(side_length=0.18, fill_color=COLOR_AUM, fill_opacity=1, stroke_width=0),
            Text("1.00% Asset Fee", font_size=15, color=COLOR_TEXT, weight=SEMIBOLD),
        ).arrange(RIGHT, buff=0.15)

        legend = VGroup(legend_flat, legend_aum).arrange(RIGHT, buff=0.4)
        legend.next_to(header_group, DOWN, buff=0.15).align_to(header_group, LEFT)

        ui_overlay = VGroup(header_group, legend)
        self.add_fixed_in_frame_mobjects(ui_overlay)

        # 3D Grid Floor
        grid_lines = VGroup()
        for y_val in range(1, 6):
            grid_lines.add(
                DashedLine(
                    start=axes.c2p(0, y_val, 0),
                    end=axes.c2p(20, y_val, 0),
                    dash_length=0.1,
                    color=COLOR_GRID,
                    stroke_width=1,
                )
            )
        for x_val in range(5, 25, 5):
            grid_lines.add(
                DashedLine(
                    start=axes.c2p(x_val, 0, 0),
                    end=axes.c2p(x_val, 5, 0),
                    dash_length=0.1,
                    color=COLOR_GRID,
                    stroke_width=1,
                )
            )

        self.play(Create(axes), Create(grid_lines), FadeIn(ui_overlay), run_time=1.5)

        # ---------------------------------------------------------
        # 4. Animated 3D Curves & Volumetric Wall Fills
        # ---------------------------------------------------------
        time_tracker = ValueTracker(0)

        # 3D Tracking Dots on the leading edge of growth
        dot_flat = Dot3D(point=axes.c2p(0, 1.0, 0), color=COLOR_FLAT, radius=0.12)
        dot_aum = Dot3D(point=axes.c2p(0, 1.0, 0), color=COLOR_AUM, radius=0.12)

        dot_flat.add_updater(
            lambda d: d.move_to(axes.c2p(time_tracker.get_value(), flat_func(time_tracker.get_value()), 0))
        )
        dot_aum.add_updater(
            lambda d: d.move_to(axes.c2p(time_tracker.get_value(), aum_func(time_tracker.get_value()), 0))
        )

        def get_flat_curve():
            t = max(0.01, time_tracker.get_value())
            return axes.plot(flat_func, x_range=[0, t], color=COLOR_FLAT, stroke_width=5)

        def get_aum_curve():
            t = max(0.01, time_tracker.get_value())
            return axes.plot(aum_func, x_range=[0, t], color=COLOR_AUM, stroke_width=5)

        def get_flat_wall():
            t = max(0.01, time_tracker.get_value())
            pts = [axes.c2p(0, 0, 0)]
            for step in np.linspace(0, t, num=30):
                pts.append(axes.c2p(step, flat_func(step), 0))
            pts.append(axes.c2p(t, 0, 0))
            return Polygon(*pts, fill_color=COLOR_FLAT_WALL, fill_opacity=0.25, stroke_width=0)

        def get_aum_wall():
            t = max(0.01, time_tracker.get_value())
            pts = [axes.c2p(0, 0, 0)]
            for step in np.linspace(0, t, num=30):
                pts.append(axes.c2p(step, aum_func(step), 0))
            pts.append(axes.c2p(t, 0, 0))
            return Polygon(*pts, fill_color=COLOR_AUM_WALL, fill_opacity=0.25, stroke_width=0)

        dynamic_flat_curve = always_redraw(get_flat_curve)
        dynamic_aum_curve = always_redraw(get_aum_curve)
        dynamic_flat_wall = always_redraw(get_flat_wall)
        dynamic_aum_wall = always_redraw(get_aum_wall)

        self.add(
            dynamic_flat_wall,
            dynamic_aum_wall,
            dynamic_flat_curve,
            dynamic_aum_curve,
            dot_flat,
            dot_aum,
        )

        # ---------------------------------------------------------
        # 5. Growth Progression & Dynamic Camera Orbiting
        # ---------------------------------------------------------
        self.move_camera(
            phi=70 * DEGREES,
            theta=-30 * DEGREES,
            zoom=0.85,
            run_time=7.0,
            rate_func=linear,
            added_anims=[time_tracker.animate.set_value(20)],
        )

        dot_flat.clear_updaters()
        dot_aum.clear_updaters()

        # ---------------------------------------------------------
        # 6. Hero Camera Pivot & 3D Endpoint Gap Highlight
        # ---------------------------------------------------------
        pt_flat = axes.c2p(20, flat_func(20), 0)
        pt_aum = axes.c2p(20, aum_func(20), 0)

        # Rotate camera to dramatic angle facing the final values
        self.move_camera(
            phi=80 * DEGREES,
            theta=-15 * DEGREES,
            zoom=1.0,
            run_time=2.0,
        )

        gap_pillar = Line3D(
            start=pt_aum,
            end=pt_flat,
            color=COLOR_DIFF,
            thickness=0.06,
        )

        sphere_flat = Sphere(center=pt_flat, radius=0.14, color=COLOR_FLAT)
        sphere_aum = Sphere(center=pt_aum, radius=0.14, color=COLOR_AUM)

        self.play(
            Create(gap_pillar),
            FadeIn(sphere_flat),
            FadeIn(sphere_aum),
            run_time=1.0,
        )

        # ---------------------------------------------------------
        # 7. End-State Callout Card (Fixed Screen Overlay)
        # ---------------------------------------------------------
        final_card_bg = RoundedRectangle(
            corner_radius=0.15,
            width=5.4,
            height=1.8,
            fill_color="#1E293B",
            fill_opacity=0.95,
            stroke_color=COLOR_DIFF,
            stroke_width=2.5,
        )

        flat_text = Text("$100/mo Flat Fee:  $4,604,000", font_size=19, color=COLOR_FLAT, weight=BOLD)
        aum_text = Text("1.00% Asset Fee:    $3,815,000", font_size=19, color=COLOR_AUM, weight=BOLD)
        divider = Line(LEFT * 2.2, RIGHT * 2.2, color="#475569", stroke_width=1)
        diff_text = Text("WEALTH DIFFERENCE: +$788,000", font_size=21, color=COLOR_DIFF, weight=BOLD)

        card_content = VGroup(flat_text, aum_text, divider, diff_text).arrange(DOWN, buff=0.12)
        final_card_bg.move_to(card_content.get_center())
        final_card = VGroup(final_card_bg, card_content)
        final_card.to_corner(DR, buff=0.4)

        self.add_fixed_in_frame_mobjects(final_card)
        self.play(FadeIn(final_card, shift=UP * 0.3), run_time=1.2)

        # Begin ambient slow camera orbit around the 3D scene
        self.begin_ambient_camera_rotation(rate=0.05)
        self.wait(4.0)


if __name__ == "__main__":
    print("3D Fee Comparison Manim Scene script ready.")
    print("Run with Manim CLI:")
    print("  python -m manim -pql fee_comparison_3d_manim.py FeeComparison3DScene")
