"""
3D Fee Comparison Animation with Enhanced Gap Highlighting (Manim Community Edition).

Features for Maximum Impact on the Fee Gap:
1. Dynamic Shaded "Wealth Gap" Volume: A glowing amber region between the two curves
   filling continuously as time moves from Year 0 to Year 20.
2. Real-Time Fee Gap Counter: A live HUD counter ticking up dynamically from $0 to $788,000.
3. Dramatic End-State Camera Zoom: Sweeps directly into the final gap area.
4. Percentage Impact Callout: Shows that 1.00% AUM cost $788,000 (17.1% of total potential wealth).

To render this animation with Manim:
    python -m manim -pql fee_comparison_3d_manim.py FeeComparison3DScene

For high quality (1080p60):
    python -m manim -pqh fee_comparison_3d_manim.py FeeComparison3DScene
"""

from manim import *
import numpy as np


class FeeComparison3DScene(ThreeDScene):
    """
    3D Manim Scene showcasing a 20-year investment fee comparison with
    an aggressive visual focus on the $788,000 wealth gap.
    """

    def construct(self):
        # ---------------------------------------------------------
        # 1. Colors & Constants
        # ---------------------------------------------------------
        COLOR_BG = "#0B0F19"       # Deep slate dark background
        COLOR_AUM = "#3B82F6"      # Electric Blue (1.00% AUM fee)
        COLOR_FLAT = "#22C55E"     # Emerald Green ($100/mo flat fee)
        COLOR_GAP = "#EF4444"      # Bright Red for the lost wealth region
        COLOR_DIFF = "#F59E0B"     # Radiant Gold for difference metrics
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
        # 2. Camera Orientation & 3D Axes
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
        # 3. Screen Overlay UI & Live Gap Counter HUD
        # ---------------------------------------------------------
        title = Text(
            "Visualizing the Investment Fee Gap (20 Years)",
            font_size=26,
            weight=BOLD,
            color=COLOR_TEXT,
        )
        subtitle = Text(
            "$1,000,000 Principal @ 8% Growth  |  1% AUM vs. $100/mo Flat Fee",
            font_size=15,
            color=COLOR_SUBTEXT,
        )
        header_group = VGroup(title, subtitle).arrange(DOWN, buff=0.1)
        header_group.to_corner(UL, buff=0.3)

        # Legend
        legend_flat = VGroup(
            Square(side_length=0.18, fill_color=COLOR_FLAT, fill_opacity=1, stroke_width=0),
            Text("$100/mo Flat Fee", font_size=14, color=COLOR_TEXT, weight=SEMIBOLD),
        ).arrange(RIGHT, buff=0.15)

        legend_aum = VGroup(
            Square(side_length=0.18, fill_color=COLOR_AUM, fill_opacity=1, stroke_width=0),
            Text("1.00% Asset Fee", font_size=14, color=COLOR_TEXT, weight=SEMIBOLD),
        ).arrange(RIGHT, buff=0.15)

        legend_gap = VGroup(
            Square(side_length=0.18, fill_color=COLOR_GAP, fill_opacity=0.8, stroke_width=0),
            Text("Wealth Lost to Fee", font_size=14, color=COLOR_GAP, weight=BOLD),
        ).arrange(RIGHT, buff=0.15)

        legend = VGroup(legend_flat, legend_aum, legend_gap).arrange(RIGHT, buff=0.35)
        legend.next_to(header_group, DOWN, buff=0.15).align_to(header_group, LEFT)

        ui_header = VGroup(header_group, legend)
        self.add_fixed_in_frame_mobjects(ui_header)

        # Live Real-Time Fee Gap Counter HUD (Top Right Corner)
        time_tracker = ValueTracker(0)

        counter_bg = RoundedRectangle(
            corner_radius=0.12,
            width=3.6,
            height=1.0,
            fill_color="#1E293B",
            fill_opacity=0.9,
            stroke_color=COLOR_GAP,
            stroke_width=2,
        )
        counter_title = Text("CUMULATIVE FEE LOSS", font_size=11, color=COLOR_SUBTEXT, weight=BOLD)

        def get_counter_text():
            t = time_tracker.get_value()
            gap_dollars = max(0.0, get_flat_value(t) - get_aum_value(t))
            val_str = f"${int(round(gap_dollars)):,}"
            num_text = Text(val_str, font_size=26, color=COLOR_GAP, weight=BOLD)
            content = VGroup(counter_title, num_text).arrange(DOWN, buff=0.05)
            counter_bg.move_to(content.get_center())
            return VGroup(counter_bg, content)

        dynamic_counter_hud = always_redraw(get_counter_text)
        hud_container = VGroup(dynamic_counter_hud).to_corner(UR, buff=0.3)
        self.add_fixed_in_frame_mobjects(hud_container)

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

        self.play(Create(axes), Create(grid_lines), FadeIn(ui_header), FadeIn(hud_container), run_time=1.5)

        # ---------------------------------------------------------
        # 4. Curves & Dynamic Glowing "Gap Volume" Shading
        # ---------------------------------------------------------
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

        # Volumetric GAP Polygon filling between the two curves
        def get_gap_polygon():
            t = max(0.01, time_tracker.get_value())
            # Trace up along flat curve, then back down along AUM curve
            pts_top = [axes.c2p(step, flat_func(step), 0) for step in np.linspace(0, t, num=35)]
            pts_bottom = [axes.c2p(step, aum_func(step), 0) for step in np.linspace(t, 0, num=35)]
            all_pts = pts_top + pts_bottom
            return Polygon(*all_pts, fill_color=COLOR_GAP, fill_opacity=0.45, stroke_color=COLOR_GAP, stroke_width=1)

        dynamic_flat_curve = always_redraw(get_flat_curve)
        dynamic_aum_curve = always_redraw(get_aum_curve)
        dynamic_gap_volume = always_redraw(get_gap_polygon)

        self.add(
            dynamic_gap_volume,
            dynamic_flat_curve,
            dynamic_aum_curve,
            dot_flat,
            dot_aum,
        )

        # ---------------------------------------------------------
        # 5. Timeline Growth with Camera Rotation
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
        # 6. Hero Camera Zoom & Dramatic End-State Gap Emphasis
        # ---------------------------------------------------------
        pt_flat = axes.c2p(20, flat_func(20), 0)
        pt_aum = axes.c2p(20, aum_func(20), 0)

        # Zoom camera right into the gap area at Year 20
        self.move_camera(
            phi=75 * DEGREES,
            theta=-15 * DEGREES,
            zoom=1.1,
            run_time=2.0,
        )

        # 3D Glowing vertical gap pillar & endpoint spheres
        gap_pillar = Line3D(
            start=pt_aum,
            end=pt_flat,
            color=COLOR_DIFF,
            thickness=0.08,
        )

        sphere_flat = Sphere(center=pt_flat, radius=0.15, color=COLOR_FLAT)
        sphere_aum = Sphere(center=pt_aum, radius=0.15, color=COLOR_AUM)

        self.play(
            Create(gap_pillar),
            FadeIn(sphere_flat),
            FadeIn(sphere_aum),
            run_time=1.0,
        )

        # ---------------------------------------------------------
        # 7. Final Wealth Gap Breakdown Overlay Card
        # ---------------------------------------------------------
        final_summary_bg = RoundedRectangle(
            corner_radius=0.15,
            width=6.0,
            height=2.2,
            fill_color="#0F172A",
            fill_opacity=0.95,
            stroke_color=COLOR_DIFF,
            stroke_width=3,
        )

        line1 = Text("Flat Fee Portfolio ($100/mo):    $4,604,000", font_size=18, color=COLOR_FLAT, weight=BOLD)
        line2 = Text("1.00% AUM Portfolio:             $3,815,000", font_size=18, color=COLOR_AUM, weight=BOLD)
        div_line = Line(LEFT * 2.6, RIGHT * 2.6, color="#475569", stroke_width=1.5)
        
        diff_val = Text("THE GAP: $788,000 LOST TO FEES", font_size=21, color=COLOR_GAP, weight=BOLD)
        pct_loss = Text("You lose 17.1% of your total potential wealth!", font_size=15, color=COLOR_DIFF, weight=BOLD)

        summary_content = VGroup(line1, line2, div_line, diff_val, pct_loss).arrange(DOWN, buff=0.1)
        final_summary_bg.move_to(summary_content.get_center())
        final_summary_card = VGroup(final_summary_bg, summary_content)
        final_summary_card.to_corner(DR, buff=0.4)

        self.add_fixed_in_frame_mobjects(final_summary_card)
        self.play(FadeIn(final_summary_card, shift=UP * 0.4), run_time=1.2)

        # Slow ambient camera rotation around the highlighted gap
        self.begin_ambient_camera_rotation(rate=0.04)
        self.wait(4.0)


if __name__ == "__main__":
    print("3D Fee Comparison Scene (Enhanced Gap Focus) ready.")
    print("Run with Manim CLI:")
    print("  python -m manim -pql fee_comparison_3d_manim.py FeeComparison3DScene")
