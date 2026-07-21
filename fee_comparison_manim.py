"""
Fee Comparison Animation using Manim (Community Edition).

Compares two investment fee structures over 20 years:
- Principal: $1,000,000
- Annualized Growth: 8.00%
- Line 1 (Blue): Asset-based fee of 1.00% / year (1% AUM fee) -> Ends at ~$3,815,000
- Line 2 (Green): Flat fee of $100 / month ($1,200 / year) -> Ends at ~$4,604,000
- Difference: ~$788,000 in wealth preserved by using a flat fee

To render this animation with Manim:
    pip install manim
    manim -pql fee_comparison_manim.py FeeComparisonScene

For high quality (1080p60 1920x1080):
    manim -pqh fee_comparison_manim.py FeeComparisonScene
"""

from manim import *


class FeeComparisonScene(Scene):
    """
    Manim Scene animating a 20-year comparison between an asset-based fee (1.00%)
    and a flat fee ($100/mo) starting from a $1,000,000 investment with 8% growth.
    """

    def construct(self):
        # ---------------------------------------------------------
        # 1. Visual Styling & Color Palette
        # ---------------------------------------------------------
        COLOR_BG = "#0F172A"       # Slate 900 dark background
        COLOR_AUM = "#3B82F6"      # Vibrant Blue for 1.00% AUM fee
        COLOR_FLAT = "#22C55E"     # Vibrant Green for $100/mo flat fee
        COLOR_DIFF = "#F59E0B"     # Amber/Gold for difference highlights
        COLOR_TEXT = "#F8FAFC"     # Off-white primary text
        COLOR_SUBTEXT = "#94A3B8"  # Muted slate secondary text
        COLOR_GRID = "#334155"     # Subtle grid lines

        # Set scene background
        self.camera.background_color = COLOR_BG

        # ---------------------------------------------------------
        # 2. Financial Calculation Functions
        # ---------------------------------------------------------
        principal = 1_000_000.0
        r_annual = 0.08
        r_m = (1.0 + r_annual) ** (1.0 / 12.0) - 1.0  # Monthly compounding rate
        aum_fee_m = 0.01 / 12.0
        flat_fee_m = 100.0

        def get_aum_value(years: float) -> float:
            """Calculate portfolio value under a 1.00% annual asset-based fee."""
            m = years * 12.0
            factor = (1.0 + r_m) * (1.0 - aum_fee_m)
            return principal * (factor ** m)

        def get_flat_value(years: float) -> float:
            """Calculate portfolio value under a $100/month flat fee."""
            m = years * 12.0
            growth_factor = (1.0 + r_m) ** m
            fee_deduction = (
                flat_fee_m * (growth_factor - 1.0) / r_m
                if r_m > 0
                else flat_fee_m * m
            )
            return principal * growth_factor - fee_deduction

        # Values scaled to Millions for Y-axis coordinates ($1M = 1.0)
        def aum_func(t: float) -> float:
            return get_aum_value(t) / 1_000_000.0

        def flat_func(t: float) -> float:
            return get_flat_value(t) / 1_000_000.0

        # ---------------------------------------------------------
        # 3. Header & Title Section
        # ---------------------------------------------------------
        title = Text(
            "Impact of Investment Fees Over 20 Years",
            font_size=32,
            weight=BOLD,
            color=COLOR_TEXT,
        )
        title.to_edge(UP, buff=0.4)

        subtitle = Text(
            "$1,000,000 Initial Principal  |  8.0% Annualized Growth",
            font_size=20,
            color=COLOR_SUBTEXT,
        )
        subtitle.next_to(title, DOWN, buff=0.15)

        header_group = VGroup(title, subtitle)
        self.play(FadeIn(header_group, shift=DOWN * 0.3), run_time=1.0)

        # ---------------------------------------------------------
        # 4. Axes & Background Grid Setup
        # ---------------------------------------------------------
        axes = Axes(
            x_range=[0, 20, 5],
            y_range=[0, 5, 1],
            x_length=9.5,
            y_length=4.5,
            axis_config={
                "color": "#475569",
                "stroke_width": 2,
                "include_tip": False,
            },
            x_axis_config={
                "numbers_to_include": [0, 5, 10, 15, 20],
                "font_size": 20,
            },
            y_axis_config={
                "numbers_to_include": [0, 1, 2, 3, 4, 5],
                "font_size": 20,
            },
        )
        axes.shift(DOWN * 0.5 + LEFT * 0.3)

        # Custom Y-axis Labels ($0M, $1M, ..., $5M)
        y_labels = VGroup()
        for y_val in range(1, 6):
            label = Text(f"${y_val}M", font_size=16, color=COLOR_SUBTEXT)
            label.next_to(axes.c2p(0, y_val), LEFT, buff=0.15)
            y_labels.add(label)

        # Axis Titles
        x_label = Text("Timeline (Years)", font_size=18, color=COLOR_SUBTEXT)
        x_label.next_to(axes.x_axis, DOWN, buff=0.4)

        y_label = Text("Portfolio Value", font_size=18, color=COLOR_SUBTEXT)
        y_label.next_to(axes.y_axis, UP, buff=0.2).align_to(axes.y_axis, LEFT)

        # Horizontal grid lines
        gridlines = VGroup()
        for y_val in range(1, 6):
            gridline = DashedLine(
                start=axes.c2p(0, y_val),
                end=axes.c2p(20, y_val),
                dash_length=0.1,
                color=COLOR_GRID,
                stroke_width=1,
            )
            gridlines.add(gridline)

        self.play(
            Create(axes),
            Create(gridlines),
            Write(y_labels),
            Write(x_label),
            Write(y_label),
            run_time=1.5,
        )

        # ---------------------------------------------------------
        # 5. Legend Setup
        # ---------------------------------------------------------
        legend_flat_box = Square(
            side_length=0.2, fill_color=COLOR_FLAT, fill_opacity=1, stroke_width=0
        )
        legend_flat_text = Text(
            "$100/mo Flat Fee", font_size=18, color=COLOR_TEXT, weight=SEMIBOLD
        )
        legend_flat = VGroup(legend_flat_box, legend_flat_text).arrange(RIGHT, buff=0.2)

        legend_aum_box = Square(
            side_length=0.2, fill_color=COLOR_AUM, fill_opacity=1, stroke_width=0
        )
        legend_aum_text = Text(
            "1.00% Asset Fee", font_size=18, color=COLOR_TEXT, weight=SEMIBOLD
        )
        legend_aum = VGroup(legend_aum_box, legend_aum_text).arrange(RIGHT, buff=0.2)

        legend = VGroup(legend_flat, legend_aum).arrange(RIGHT, buff=0.6)
        legend.next_to(axes, UP, buff=0.25).align_to(axes, LEFT)
        self.play(FadeIn(legend), run_time=0.8)

        # ---------------------------------------------------------
        # 6. Animated Line Growth (Year 0 -> Year 20)
        # ---------------------------------------------------------
        # ValueTracker for smooth continuous animation of time
        time_tracker = ValueTracker(0)

        # Moving tracker dots on the leading edge of each graph
        dot_flat = Dot(point=axes.c2p(0, 1.0), color=COLOR_FLAT, radius=0.08)
        dot_aum = Dot(point=axes.c2p(0, 1.0), color=COLOR_AUM, radius=0.08)

        dot_flat.add_updater(
            lambda d: d.move_to(
                axes.c2p(time_tracker.get_value(), flat_func(time_tracker.get_value()))
            )
        )
        dot_aum.add_updater(
            lambda d: d.move_to(
                axes.c2p(time_tracker.get_value(), aum_func(time_tracker.get_value()))
            )
        )

        # Dynamic subgraphs driven by time_tracker
        def get_flat_subgraph():
            t = time_tracker.get_value()
            if t <= 0.01:
                t = 0.01
            return axes.plot(flat_func, x_range=[0, t], color=COLOR_FLAT, stroke_width=4)

        def get_aum_subgraph():
            t = time_tracker.get_value()
            if t <= 0.01:
                t = 0.01
            return axes.plot(aum_func, x_range=[0, t], color=COLOR_AUM, stroke_width=4)

        dynamic_flat_line = always_redraw(get_flat_subgraph)
        dynamic_aum_line = always_redraw(get_aum_subgraph)

        self.add(dynamic_flat_line, dynamic_aum_line, dot_flat, dot_aum)

        # Animate progression from Year 0 to Year 20
        self.play(
            time_tracker.animate.set_value(20),
            run_time=6.0,
            rate_func=linear,
        )

        # Freeze updaters upon reaching Year 20
        dot_flat.clear_updaters()
        dot_aum.clear_updaters()

        # ---------------------------------------------------------
        # 7. Endpoint Highlights & Final Totals
        # ---------------------------------------------------------
        pt_flat = axes.c2p(20, flat_func(20))
        pt_aum = axes.c2p(20, aum_func(20))

        # Pulse dots at the endpoint
        dot_flat_pulse = Dot(point=pt_flat, color=COLOR_FLAT, radius=0.15)
        dot_aum_pulse = Dot(point=pt_aum, color=COLOR_AUM, radius=0.15)
        self.play(
            Transform(dot_flat, dot_flat_pulse),
            Transform(dot_aum, dot_aum_pulse),
            run_time=0.5,
        )

        # Callout card for Flat Fee ($4,604,000)
        callout_flat_bg = Rectangle(
            width=2.5,
            height=0.65,
            fill_color=COLOR_BG,
            fill_opacity=0.9,
            stroke_color=COLOR_FLAT,
            stroke_width=2,
        )
        callout_flat_val = Text("$4,604,000", font_size=20, color=COLOR_FLAT, weight=BOLD)
        callout_flat_sub = Text("($100/mo flat)", font_size=12, color=COLOR_SUBTEXT)
        callout_flat_text = VGroup(callout_flat_val, callout_flat_sub).arrange(DOWN, buff=0.05)
        callout_flat_bg.move_to(callout_flat_text.get_center())
        callout_flat = VGroup(callout_flat_bg, callout_flat_text)
        callout_flat.next_to(pt_flat, RIGHT, buff=0.25).shift(UP * 0.1)

        # Callout card for AUM Fee ($3,815,000)
        callout_aum_bg = Rectangle(
            width=2.5,
            height=0.65,
            fill_color=COLOR_BG,
            fill_opacity=0.9,
            stroke_color=COLOR_AUM,
            stroke_width=2,
        )
        callout_aum_val = Text("$3,815,000", font_size=20, color=COLOR_AUM, weight=BOLD)
        callout_aum_sub = Text("(1.00% AUM)", font_size=12, color=COLOR_SUBTEXT)
        callout_aum_text = VGroup(callout_aum_val, callout_aum_sub).arrange(DOWN, buff=0.05)
        callout_aum_bg.move_to(callout_aum_text.get_center())
        callout_aum = VGroup(callout_aum_bg, callout_aum_text)
        callout_aum.next_to(pt_aum, RIGHT, buff=0.25).shift(DOWN * 0.1)

        self.play(
            FadeIn(callout_flat, shift=LEFT * 0.2),
            FadeIn(callout_aum, shift=LEFT * 0.2),
            run_time=1.0,
        )

        # ---------------------------------------------------------
        # 8. $788,000 Wealth Difference Callout
        # ---------------------------------------------------------
        # Double arrow between final points
        diff_arrow = DoubleArrow(
            start=pt_aum,
            end=pt_flat,
            color=COLOR_DIFF,
            stroke_width=3,
            tip_length=0.15,
            buff=0,
        )

        # High-impact difference highlight card
        diff_card_bg = RoundedRectangle(
            corner_radius=0.15,
            width=3.6,
            height=1.15,
            fill_color="#1E293B",
            fill_opacity=0.95,
            stroke_color=COLOR_DIFF,
            stroke_width=2,
        )
        diff_title = Text("1.00% AUM FEE COST YOU", font_size=12, color=COLOR_SUBTEXT, weight=BOLD)
        diff_amount = Text("$788,000", font_size=32, color=COLOR_DIFF, weight=BOLD)
        diff_desc = Text("in lost compound wealth", font_size=13, color=COLOR_TEXT)

        diff_content = VGroup(diff_title, diff_amount, diff_desc).arrange(DOWN, buff=0.06)
        diff_card_bg.move_to(diff_content.get_center())
        diff_card = VGroup(diff_card_bg, diff_content)

        # Position card in the upper-left quadrant of the plot area
        diff_card.move_to(axes.c2p(7.5, 3.8))

        # Dashed connector line between the card and the difference arrow
        connector_line = DashedLine(
            start=diff_card.get_right(),
            end=diff_arrow.get_center(),
            color=COLOR_DIFF,
            stroke_width=1.5,
            dash_length=0.08,
        )

        self.play(
            Create(diff_arrow),
            FadeIn(diff_card, scale=0.9),
            Create(connector_line),
            run_time=1.2,
        )

        # Final pause for viewer review
        self.wait(3.0)


if __name__ == "__main__":
    print("Fee Comparison Manim Scene script ready.")
    print("Run with Manim CLI:")
    print("  manim -pql fee_comparison_manim.py FeeComparisonScene")
