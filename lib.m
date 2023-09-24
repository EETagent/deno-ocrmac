#include <AppKit/AppKit.h>

#import <Vision/Vision.h>

// -framework Foundation -framework Vision -framework CoreGraphics

int8_t getTextFromImageByteArray(uint8_t *buffer, uint64 len, uint8_t recognitionLevel, bool languageCorrection, uint8_t imageOrientation, const char **text, const char **error) {
    NSData *data = [NSData dataWithBytes:buffer length:len];
    
    NSImage *image = [[NSImage alloc] initWithData:data];

    CGImageRef cgImage = [image CGImageForProposedRect:NULL context:NULL hints:NULL];

    VNImageRequestHandler *vnImageHandler = [[VNImageRequestHandler alloc] initWithCGImage:cgImage orientation:imageOrientation
                                                                                   options:@{}];
    __block NSString *blockOutput = nil;
    __block NSError *blockError = nil;

    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

    VNRecognizeTextRequest *vnTextRequest = [[VNRecognizeTextRequest alloc] initWithCompletionHandler:(VNRequestCompletionHandler)^(VNRequest * _Nonnull request, NSError * _Nullable err) {
        if (err) {
            blockError = [err copy];
            dispatch_semaphore_signal(semaphore);
        }

        NSArray *results = [request results];
        //NSLog(@"results: %@", results);

        for (VNRecognizedTextObservation *observation in results) {
            NSString *text = [[observation topCandidates:1][0] string];
            //NSLog(@"text: %@", text);
            blockOutput = [text copy];
        }

        dispatch_semaphore_signal(semaphore);
    }];

    [vnTextRequest setRecognitionLevel:recognitionLevel];
    [vnTextRequest setUsesLanguageCorrection:languageCorrection];

    NSError *requestError = nil;
    [vnImageHandler performRequests:@[vnTextRequest] error:&requestError];

    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);

    if (requestError) {
        *error = [[requestError localizedDescription] UTF8String];
        return 1;
    }

    if (blockError) {
        *error = [[blockError localizedDescription] UTF8String];
        return 1;
    }

    //printf("%s", [blockOutput UTF8String]);
    *text = [blockOutput UTF8String];

    return 0;
}