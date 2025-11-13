import SwiftUI

/// A custom layout that animates two child views proportionally along a chosen axis.
/// The layout guarantees that each child keeps enough space to fit its intrinsic content size
/// while distributing any extra space using animatable fractions. This avoids the repeated
/// layout thrashing that can occur when animating frames directly in SwiftUI.
struct ProportionalSplitLayout: Layout {
    enum Axis {
        case vertical
        case horizontal
    }

    struct Cache {
        var size: CGSize = .zero
        var leadingExtent: CGFloat = 0
        var trailingExtent: CGFloat = 0
    }

    var axis: Axis
    var leadingFraction: CGFloat
    var trailingFraction: CGFloat

    init(axis: Axis, leadingFraction: CGFloat, trailingFraction: CGFloat) {
        self.axis = axis
        self.leadingFraction = leadingFraction
        self.trailingFraction = trailingFraction
    }

    var animatableData: AnimatablePair<CGFloat, CGFloat> {
        get { AnimatablePair(leadingFraction, trailingFraction) }
        set {
            leadingFraction = newValue.first
            trailingFraction = newValue.second
        }
    }

    func makeCache(subviews: Subviews) -> Cache {
        Cache()
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout Cache) -> CGSize {
        let measurement = measure(proposal: proposal, subviews: subviews)
        cache = measurement
        return measurement.size
    }

    func placeSubviews(
        in bounds: CGRect,
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout Cache
    ) {
        let measurement: Cache
        if cache.size == .zero {
            measurement = measure(proposal: proposal, subviews: subviews)
            cache = measurement
        } else {
            measurement = cache
        }

        guard subviews.count == 2 else { return }

        switch axis {
        case .vertical:
            let widthProposal = ProposedViewSize(width: bounds.width, height: measurement.leadingExtent)
            subviews[0].place(
                at: CGPoint(x: bounds.minX, y: bounds.minY),
                anchor: .topLeading,
                proposal: widthProposal
            )

            let bottomProposal = ProposedViewSize(width: bounds.width, height: measurement.trailingExtent)
            subviews[1].place(
                at: CGPoint(x: bounds.minX, y: bounds.minY + measurement.leadingExtent),
                anchor: .topLeading,
                proposal: bottomProposal
            )

        case .horizontal:
            let heightProposal = ProposedViewSize(width: measurement.leadingExtent, height: bounds.height)
            subviews[0].place(
                at: CGPoint(x: bounds.minX, y: bounds.minY),
                anchor: .topLeading,
                proposal: heightProposal
            )

            let trailingProposal = ProposedViewSize(width: measurement.trailingExtent, height: bounds.height)
            subviews[1].place(
                at: CGPoint(x: bounds.minX + measurement.leadingExtent, y: bounds.minY),
                anchor: .topLeading,
                proposal: trailingProposal
            )
        }
    }

    private func measure(proposal: ProposedViewSize, subviews: Subviews) -> Cache {
        guard subviews.count == 2 else { return Cache() }

        let clampedLeading = max(0, min(1, leadingFraction))
        let clampedTrailing = max(0, min(1, trailingFraction))
        let totalWeight = max(clampedLeading + clampedTrailing, .leastNonzeroMagnitude)

        switch axis {
        case .vertical:
            let intrinsicSizes = subviews.map { $0.sizeThatFits(.unspecified) }
            let maxWidth = intrinsicSizes.map(\.width).max() ?? 0
            let proposedWidth = proposal.width ?? maxWidth
            let finalWidth = max(maxWidth, proposedWidth)

            let minimumHeights = intrinsicSizes.map(\.height)
            let minimumTotal = minimumHeights.reduce(0, +)
            let proposedHeight = proposal.height ?? minimumTotal
            let targetHeight = max(proposedHeight, minimumTotal)

            let extra = max(0, targetHeight - minimumTotal)
            let leadingExtra = extra * (clampedLeading / totalWeight)
            let trailingExtra = extra * (clampedTrailing / totalWeight)

            let leadingExtent = minimumHeights[0] + leadingExtra
            let trailingExtent = minimumHeights[1] + trailingExtra
            let totalHeight = leadingExtent + trailingExtent

            return Cache(
                size: CGSize(width: finalWidth, height: totalHeight),
                leadingExtent: leadingExtent,
                trailingExtent: trailingExtent
            )

        case .horizontal:
            let intrinsicSizes = subviews.map { $0.sizeThatFits(.unspecified) }
            let maxHeight = intrinsicSizes.map(\.height).max() ?? 0
            let proposedHeight = proposal.height ?? maxHeight
            let finalHeight = max(maxHeight, proposedHeight)

            let minimumWidths = intrinsicSizes.map(\.width)
            let minimumTotal = minimumWidths.reduce(0, +)
            let proposedWidth = proposal.width ?? minimumTotal
            let targetWidth = max(proposedWidth, minimumTotal)

            let extra = max(0, targetWidth - minimumTotal)
            let leadingExtra = extra * (clampedLeading / totalWeight)
            let trailingExtra = extra * (clampedTrailing / totalWeight)

            let leadingExtent = minimumWidths[0] + leadingExtra
            let trailingExtent = minimumWidths[1] + trailingExtra
            let totalWidth = leadingExtent + trailingExtent

            return Cache(
                size: CGSize(width: totalWidth, height: finalHeight),
                leadingExtent: leadingExtent,
                trailingExtent: trailingExtent
            )
        }
    }
}
