(define-data-var organiser principal 'SP2AYGM74FNMJT9M197EJSB49P88NRH0ES1KZD1BX)
(define-data-var total-beneficiaries uint u0)
(define-data-var total-donated uint u0)
(define-data-var open bool true)

(define-map beneficiaries 
    (
        (id principal)
    )
    (
        (distributed bool)
    )
)

(define-read-only (does-exist (id principal))
    (is-some (map-get? beneficiaries ((id id))))
)

(define-read-only (get-total-beneficiaries)
    (var-get total-beneficiaries)
)

(define-read-only (total-per-beneficiary)
    (/ (var-get total-donated) (var-get total-beneficiaries))
)

(define-public (add-beneficiary (id principal))
    (if
        (and (is-organiser) (var-get open))
        (if 
            (is-eq false (does-exist id))
            (ok (add-to-beneficiaries id))
            (err "id already registered")
        )
        (err "only organiser can add beneficiary")
    )
)

(define-public (donate (amount uint))
    (begin 
        (unwrap-panic (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (var-set total-donated (+ (var-get total-donated) amount))
        (ok (var-get total-donated))
    )
)

(define-public (distribute (pages (list 10 int)))
    (if 
        (is-organiser)
        (ok (map distribute-to-page pages))
        (err "only organiser can start distribution")
    )
)

(define-private (is-organiser)
    (is-eq tx-sender (var-get organiser))
)

(define-private (add-to-beneficiaries (id principal))
    (begin 
        (map-set beneficiaries 
            (
                (id id)
            )
            (
                (distributed false)
            )
        )
        (contract-call?
            'SP1FXTNRCXQW7CNKKRXZQZPZPKKVPAZS6JYX25YP5.endless-list
            add-item
            id)
        (var-set total-beneficiaries (+ (var-get total-beneficiaries) u1))
    )
)

(define-private (distribute-to-page (page int))
    (map
        distribute-to-beneficiary
        (get items (unwrap-panic (contract-call?
            'SP1FXTNRCXQW7CNKKRXZQZPZPKKVPAZS6JYX25YP5.endless-list
            get-items-map-at-page
            page)))
    )
)

(define-private (distribute-to-beneficiary (beneficiary principal))
    (if
        (get distributed (unwrap-panic (map-get? beneficiaries ((id beneficiary)))))
        (err "already recieved distribution")
        (ok (begin 
            (as-contract (unwrap-panic (stx-transfer? (total-per-beneficiary) tx-sender beneficiary)))
            (map-set beneficiaries 
                (
                    (id beneficiary)
                )
                (
                    (distributed true)
                )
            )
        ))
    )
)