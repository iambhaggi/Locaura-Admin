import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

class AppImage extends StatelessWidget {
  static const String _fallbackImageAsset = 'assets/images/file-not-found.jpg';

  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? placeholder;
  final Widget? errorWidget;
  final BorderRadius? borderRadius;

  const AppImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorWidget,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final bool hasUrl = imageUrl != null && imageUrl!.isNotEmpty;

    Widget imageWidget;

    if (!hasUrl) {
      imageWidget = _buildErrorWidget();
    } else if (imageUrl!.startsWith('http')) {
      imageWidget = CachedNetworkImage(
        imageUrl: imageUrl!,
        width: width,
        height: height,
        fit: fit,
        placeholder: (context, url) => placeholder ?? _buildPlaceholderWidget(),
        errorWidget: (context, url, error) => errorWidget ?? _buildErrorWidget(),
      );
    } else {
      imageWidget = Image.asset(
        imageUrl!,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (context, error, stackTrace) => _buildErrorWidget(),
      );
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: imageWidget,
      );
    }

    return imageWidget;
  }

  Widget _buildPlaceholderWidget() {
    return Image.asset(
      _fallbackImageAsset,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) => _buildFallbackContainer(),
    );
  }

  Widget _buildErrorWidget() {
    return Image.asset(
      _fallbackImageAsset,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) => _buildFallbackContainer(),
    );
  }

  Widget _buildFallbackContainer() {
    return Container(
      width: width,
      height: height,
      color: Colors.grey.shade200,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.image_not_supported_outlined, color: Colors.grey.shade500, size: 32),
          if (height != null && height! > 60) ...[
            const SizedBox(height: 4),
            Text(
              'No image',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
            ),
          ],
        ],
      ),
    );
  }
}
